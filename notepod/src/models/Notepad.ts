export default class NotepadModel {
    url: string;
    title: string;
    creator: string;
    createdAt: Date;
    coworkers: string[];
  
    constructor(url: string, title: string, creator: string, createdAt: Date, coworkers:string[]) {
      this.url = url;
      this.title = title;
      this.creator = creator;
      this.createdAt = createdAt;
      this.coworkers = coworkers;
    }
  }

  