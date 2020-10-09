import { TripleDocument } from 'plandoc';
import { rdf, schema } from 'rdf-namespaces';

export async function addNote(title: string, notes: string, notesList: TripleDocument): Promise<TripleDocument> {
  const newNote = notesList.addSubject();
  newNote.addRef(rdf.type, schema.TextDigitalDocument);
  newNote.addString(schema.title, title);
  newNote.addString(schema.text, notes);
  newNote.addDateTime(schema.dateCreated, new Date(Date.now()));

  return await notesList.save([newNote]);
}
