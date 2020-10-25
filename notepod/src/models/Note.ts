export default class NoteModel {
    url: string;
    title: string;
    content: string;
    notepodUrl: string;
    creator: string;
    createdAt: Date;
    tags:string[];

    constructor(url: string, title: string, content: string, notepodUrl: string, creator: string, createdAt: Date, tags:string[]) {
        this.url = url;
        this.title = title;
        this.content = content;
        this.notepodUrl = notepodUrl;
        this.creator = creator;
        this.createdAt = createdAt;
        this.tags = tags;
    }
}