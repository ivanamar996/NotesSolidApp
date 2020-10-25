export default class Utils {

    static getBaseUrl(url: any): string {
        return url ? url.match(/^(([a-z]+:)?(\/\/)?[^/]+\/).*$/)[1] : "";
    }

    static getRandomString():string{
        return Math.random().toString(36).substring(7);
    }

}