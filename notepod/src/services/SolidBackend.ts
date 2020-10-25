import * as $rdf from "rdflib";
import auth from 'solid-auth-client';
import NotepadModel from "../models/Notepad";
import Utils from '../services/Utils';
import NoteModel from "../models/Note";

const SolidFileCLient = require('solid-file-client');
const fileClient = new SolidFileCLient(auth);

// Definitions of the RDF namespaces.
const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#");
const SOLID = $rdf.Namespace("http://www.w3.org/ns/solid/terms#");
const FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
const DCT = $rdf.Namespace("http://purl.org/dc/terms/");
const SIOC = $rdf.Namespace("http://rdfs.org/sioc/ns#");
const XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
const VCARD = $rdf.Namespace("http://www.w3.org/2006/vcard/ns#");
const ACL = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
const AS = $rdf.Namespace("https://www.w3.org/ns/activitystreams#");

// Definitions of the concrete RDF node objects.
const POST = SIOC("Post");
const TIME = XSD("dateTime");
const NOTE = AS("Note");

class SolidBackend {

  _store: $rdf.IndexedFormula;
  _fetcher: $rdf.Fetcher;
  _updater: $rdf.UpdateManager;

  constructor() {
    this._store = $rdf.graph();
    this._fetcher = new $rdf.Fetcher(this.store);
    this._updater = new $rdf.UpdateManager(this.store);
  }

  set store(store) {
    this._store = store;
  }

  set fetcher(fetcher) {
    this._fetcher = fetcher;
  }

  set updater(updater) {
    this._updater = updater;
  }

  get store() {
    return this._store;
  }

  get fetcher() {
    return this._fetcher;
  }

  get updater() {
    return this._updater;
  }

  async load(document: $rdf.NamedNode) {
    try {
      return await this.fetcher.load(document);
    } catch (err) {
      return Promise.reject(new Error("Could not fetch the document."));
    }
  }

  async update(deletions: $rdf.Statement[], insertions: $rdf.Statement[]) {
    try {
      await this.updater.update(deletions, insertions, (uri, ok, message, response) => {
        if (ok) console.log("Resource updated.");
        else console.log(message);
      });
    } catch (err) {
      return Promise.reject(new Error("Could not update the document."));
    }
  }

  registerChanges(document: $rdf.NamedNode) {
    this.updater.addDownstreamChangeListener(document, () => { });
  }

  async getAppFolder(webId: string): Promise<string> {
    const user = $rdf.sym(webId);
    const doc = user.doc();
    try {
      await this.load(doc);
    } catch (err) {
      return Promise.reject(err);
    }
    const folder = this.store.any(user, SOLID("timeline"), null, doc);
    return folder ? folder.value.toString() : Promise.reject(new Error("No application folder."));
  }

  async getValidAppFolder(webId: string): Promise<string> {
    try {
      const folder = await this.getAppFolder(webId);
      if (folder)
        return folder;
    } catch (err) {
      return Promise.reject(err);
    }
    return Promise.reject(new Error("No valid application folder."));
  }

  async createAppFolders(webId: string, folderUrl: string): Promise<boolean> {

    const notesUrl = folderUrl + "notes/";
    const notepadsUrl = folderUrl + "notepads/";

    try {
      if (!(await fileClient.itemExists(folderUrl))) {
        await fileClient.createFolder(folderUrl).then((success: any) => {
          console.log(`Created folder ${folderUrl}.`);
        });
      }
      if (!(await fileClient.itemExists(notepadsUrl))) {
        await fileClient.createFolder(notepadsUrl).then((success: any) => {
          console.log(`Created folder ${notepadsUrl}.`);
        });
      }
      if (!(await fileClient.itemExists(notesUrl))) {
        await fileClient.createFolder(notesUrl).then((success: any) => {
          console.log(`Created folder ${notesUrl}.`);
        });
      }
      await this.updateAppFolder(webId, folderUrl).then((success: any) => {
        console.log(`Updated app folder in profile.`);
      });
      
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }

  async updateAppFolder(webId: string, folderUrl: string): Promise<boolean> {
    const user = $rdf.sym(webId);
    const predicate = $rdf.sym(SOLID("timeline").value);
    const folder = $rdf.sym(folderUrl);
    const profile = user.doc();
    try {
      await this.load(profile);
    } catch (err) {
      console.log("Could not load a profile document.");
      return false;
    }
    const ins = [$rdf.st(user, predicate, folder, profile)];
    const del = this.store.statementsMatching(user, predicate, null, profile);
    try {
      await this.updateResource(profile.value, ins, del);
    } catch (err) {
      return false;
    }
    this.registerChanges(profile);
    return true;
  }

  async updateResource(resourceUrl: string, insertions: $rdf.Statement[], deletions: $rdf.Statement[]): Promise<void> {
    const resource = $rdf.sym(resourceUrl);
    try {
      await this.load(resource);
      await this.update(deletions, insertions);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async createNotepad(title: string, webId: string, coworkers: string[]): Promise<NotepadModel> {
    const appFolder = Utils.getBaseUrl(webId) + 'public/solidapp/';
    const notepadName = appFolder + "notepads/" + Utils.getRandomString();
    let notepadFileUrl = notepadName + ".ttl";
    const created = new Date(Date.now());

    try {
      const notepadFileTtl = this.createUploadNotepadStatement(notepadFileUrl, title, webId, created, coworkers);
      await fileClient.createFile(notepadFileUrl, notepadFileTtl.join("\n").toString(),'text/turtle').then((fileCreated : any) => {
        console.log(`Created notepad data ${fileCreated}.`);
      });
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
    return new NotepadModel(notepadFileUrl,title,webId,created, coworkers);
  }

  async updateNotepad(notepad:NotepadModel): Promise<boolean> {
    const created = new Date(Date.now());
    try {
      const notepadFileTtl = this.createUploadNotepadStatement(notepad.url, notepad.title, notepad.creator, created, notepad.coworkers);
      await fileClient.createFile(notepad.url, notepadFileTtl.join("\n").toString(), 'text/turtle').then((fileCreated : any) => {
        console.log(`Updated notepad data ${fileCreated}.`);
      });
      const notes = this.getNotes(notepad.url);
      (await notes).forEach((note:NoteModel)=>{
        this.updateNote(note);
      });
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
    return true;
  }

  createUploadNotepadStatement(notepadUrl: string, title: string, user: string, createdAt: Date, coworkers:string[]) : $rdf.Statement[] {
    const notepadFile = $rdf.sym(notepadUrl);
    const desc = $rdf.lit(title);
    let cowork = coworkers.toString();
    if(!cowork.includes(','))
    cowork = cowork + ','
    const coworkValue = $rdf.lit(cowork);
    const creator = $rdf.sym(user);
    const doc = notepadFile.doc();

    return [
      $rdf.st(notepadFile, RDF("type"), SIOC("Post"), doc),
      $rdf.st(notepadFile, FOAF("title"), desc, doc),
      $rdf.st(notepadFile, DCT("creator"), creator, doc),
      $rdf.st(notepadFile, DCT("coworkers"), coworkValue, doc),
      $rdf.st(notepadFile, DCT("created"), $rdf.lit(createdAt.toISOString(), "", TIME), doc)
    ];
  }

  async getNotepads(webId: string): Promise<NotepadModel[]> {
    const appFolder = Utils.getBaseUrl(webId) + 'public/solidapp/';
    let folder;
    try {
      folder = appFolder ? appFolder : await this.getValidAppFolder(webId);
    } catch (err) {
      console.log(err);
      return [];
    }
    if (!folder) return [];
    const notepads : NotepadModel[] = [];
    const notepadsFolder = $rdf.sym(folder + "notepads/");
    try {
      await this.load(notepadsFolder);
    } catch (err) {
      console.log(err);
      return [];
    }
    const files = this.store.each(notepadsFolder, LDP("contains"), null, notepadsFolder);
    for (var i in files) {
      if (String(files[i].value).endsWith(".ttl")) {
        await this.getNotepad(files[i].value).then((notepad:any) => {
          notepads.push(notepad);
        }).catch((err:any) => console.log(err));
      }
    }
    this.registerChanges(notepadsFolder);
    return notepads.sort((a, b) => (a.createdAt.getDate() - b.createdAt.getDate()));
  }

  async getNotepad(url: string): Promise<NotepadModel> {
    const fileUrl = $rdf.sym(url);
    const file = fileUrl.doc();
    try {
      await this.load(file);
    } catch (err) {
      return Promise.reject(err);
    }
    const type = this.store.match(fileUrl, RDF("type"), POST, file);
    if (type) {
      const title = this.store.any(fileUrl, FOAF("title"), null, file);
      const creator = this.store.any(fileUrl, DCT("creator"), null, file);
      const created = this.store.any(fileUrl, DCT("created"), null, file);
      const coworkers = this.store.any(fileUrl, DCT("coworkers"),null,file);
      if(title?.value && created?.value && creator?.value && coworkers?.value){
        if(coworkers?.value!="-")
          return new NotepadModel(url, title.value, creator.value, new Date(created.value), coworkers.value.split(','));
        else
          return new NotepadModel(url, title.value, creator.value, new Date(created.value), []);
      }
    }
    return Promise.reject(new Error("Notepad not found."));
  }

  async getFriendsWebId(webId: string): Promise<string[]> {
    const user = $rdf.sym(webId);
    const doc = user.doc();
    try {
      await this.load(doc);
    } catch (err) {
      console.log("Could not load a profile document.");
      return Promise.reject(err);
    }
    return this.store.each(user, FOAF("knows"), null, doc).map(friend => friend.value);
  }

  async getFriendsNotepads(webId: string): Promise<NotepadModel[]> {
    const friendsIds = await this.getFriendsWebId(webId);
    const notepads = await Promise.all( friendsIds.map(friendId => this.getNotepads(friendId)));
    const retNotepads: NotepadModel[] = [];
    notepads.flat().forEach(async function(notepad){
       if(notepad.coworkers.includes(Utils.getBaseUrl(webId))){
         retNotepads.push(notepad);
       }
    });

    return retNotepads;
  }

  async getAllNotepads(webId: string): Promise<NotepadModel[]> {
    const retNotepads:NotepadModel[] = [];

    await this.getNotepads(webId).then((data:NotepadModel[])=>{
      retNotepads.push(...data);
    });
    await this.getFriendsNotepads(webId).then((data:NotepadModel[])=>{
      retNotepads.push(...data);
    });

    return retNotepads;
  }

  async createNote(webId: string, notepadUrl: string, title: string, content:string, tags:string[]) : Promise<NoteModel> {
    const noteUrl = Utils.getBaseUrl(webId) + 'public/solidapp/notes/' + Utils.getRandomString() + ".ttl";
    const created = new Date(Date.now());
    const note = this.createNoteStatement(noteUrl,notepadUrl,webId,title,content,created,tags);
    const noteRecord = this.createActivityRecordStatement(noteUrl, notepadUrl);
    try {
      await fileClient.createFile(noteUrl, note.join("\n").toString(),'text/turtle').then((fileCreated: any) => {
        console.log(`Created a note ${fileCreated}.`);
      });
      await this.updateResource(notepadUrl, noteRecord, []);
    } catch (err) {
      console.log(err);
      Promise.reject(err);
    }
    return new NoteModel(noteUrl,title,content,notepadUrl,webId,created,tags);
  }

  createNoteStatement(noteUrl: string, notepad: string, webId: string, title: string, content: string,createdAt:Date ,tags:string[]) : $rdf.Statement[] {
    const user = $rdf.sym(webId);
    const notepadUrl = $rdf.sym(notepad);
    const doc = $rdf.sym(noteUrl);
    const tit = $rdf.lit(title);
    const con = $rdf.lit(content);
    let tag = tags.toString();
    if(!tag.includes(','))
      tag = tag + ','
    const tagValue = $rdf.lit(tag);
    const note = [
      $rdf.st(doc, AS("type"), AS("Note"), doc),
      $rdf.st(doc, AS("actor"), user, doc),
      $rdf.st(doc, AS("title"), tit, doc),
      $rdf.st(doc, AS("notepad"), notepadUrl, doc),
      $rdf.st(doc, AS("content"),con, doc),
      $rdf.st(doc, AS("tags"),tagValue, doc),
      $rdf.st(doc, DCT("created"), $rdf.lit(createdAt.toISOString(), "", TIME), doc)
    ];
    return note;
  }

  createActivityRecordStatement(activityUrl: string, object: string) : $rdf.Statement[] {
    const activity = $rdf.sym(activityUrl);
    const doc = $rdf.sym(object);
    return [ $rdf.st(activity, AS("type"), NOTE, doc) ];
  }

  async getNotes(notepadUrl: string): Promise<NoteModel[]> {
    const resource = $rdf.sym(notepadUrl);
    try {
      await this.load(resource);
    } catch (err) {
      console.log(err);
      Promise.reject(err);
    }
    const notes:NoteModel[] = [];
    const noteRecords = this.store.each(null, AS("type"), NOTE, resource);
    for (var i in noteRecords) {
      await this.getNote(noteRecords[i].value).then((note:NoteModel) => {
        notes.push(note);
      }).catch((e:any) => console.log(e));
    }
    this.registerChanges(resource);
    return notes;
  }

  async getNote(noteUrl: string): Promise<NoteModel> {
    const note = $rdf.sym(noteUrl);
    const doc = note.doc();
    try {
      await this.load(doc);
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
    const type = this.store.match(note, AS("type"), NOTE, doc);
    if (type) {
      const creator = this.store.any(note, AS("actor"), null, doc);
      const title = this.store.any(note, AS("title"), null, doc);
      const notepadUrl = this.store.any(note, AS("notepad"), null, doc);
      const content = this.store.any(note, AS("content"), null, doc);
      const tags = this.store.any(note, AS("tags"), null, doc);
      const createdAt = this.store.any(note, DCT("created"), null, doc);
      if(title?.value && content?.value && notepadUrl?.value && creator?.value && createdAt?.value && tags?.value){
        if(tags.value.includes(","))
          return new NoteModel(noteUrl,title.value,content.value,notepadUrl.value,creator.value,new Date(createdAt.value),tags.value.split(','));
        return new NoteModel(noteUrl,title.value,content.value,notepadUrl.value,creator.value,new Date(createdAt.value),[]);
      }
    }
    return Promise.reject(new Error("Note not found."));
  }

  async updateNote(note:NoteModel): Promise<boolean> {
    const created = new Date(Date.now());
    const noteStatement = this.createNoteStatement(note.url,note.notepodUrl,note.creator,note.title,note.content,created,note.tags);
    const noteRecord = this.createActivityRecordStatement(note.url, note.notepodUrl);
    try {
      await fileClient.createFile(note.url, noteStatement.join("\n").toString(),'text/turtle').then((fileCreated: any) => {
        console.log(`Updated a note ${fileCreated}.`);
      });
      await this.updateResource(note.notepodUrl, noteRecord, []);
    } catch (err) {
      console.log(err);
      Promise.reject(err);
    }
    return true;
  }

  async deleteNote(note:NoteModel): Promise<boolean>{

    if(await fileClient.itemExists(note.url)){
      await fileClient.deleteFile(note.url).then((success:any)=>{
        console.log("File successfilly deleted.");
      })
    }

    return true;
  }
}

export default new SolidBackend();