import auth from 'solid-auth-client';
const SolidAclUtils = require('solid-acl-utils')

const { AclApi, Permissions } = SolidAclUtils
const { READ, WRITE, CONTROL } = Permissions

class AclUtils {

    async addOwnersPermissions(webId:string, fileUrl:string) {
        const fetch = auth.fetch.bind(auth);
        const aclApi = new AclApi(fetch, { autoSave: true });
        const acl = await aclApi.loadFromFileUrl(fileUrl);
        await acl.addRule([READ, WRITE, CONTROL], webId);
    }

    async addCoworkers(notepadUrl:string, webIds:string[]){
        const fetch = auth.fetch.bind(auth);
        const aclApi = new AclApi(fetch, { autoSave: true });
        const acl = await aclApi.loadFromFileUrl(notepadUrl);
        webIds.forEach(async function(webId){
            await acl.addRule([READ, WRITE, CONTROL], webId);
        });
    }

    async getCoworkers(notepadUrl:string, ownerWebId:string){
        const fetch = auth.fetch.bind(auth);
        const aclApi = new AclApi(fetch, { autoSave: true });
        const acl = await aclApi.loadFromFileUrl(notepadUrl);
        const returnWebIds : string[] = [];
        const agents = acl.getAgentsWith([READ,WRITE, CONTROL]);
        if(agents.webIds.size>0){
            agents.webIds.forEach(function(webId:any){
                if(webId!= ownerWebId)
                    returnWebIds.push(webId);
            });
        }
        return returnWebIds;
    }

    async deleteCoworker(notepadUrl:string, webId:string) {
        const fetch = auth.fetch.bind(auth);
        const aclApi = new AclApi(fetch, { autoSave: true });
        const acl = await aclApi.loadFromFileUrl(notepadUrl);
        await acl.deleteRule([READ, WRITE,CONTROL], webId)
    }
}

export default new AclUtils();