import { Injector } from "@furystack/inject";
import { expect } from "chai";
import { ServerResponse } from "http";
import { UserContextService } from "../../src";
import { GetCurrentUser } from "../../src/Actions/GetCurrentUser";

export const getCurrentUserTests = describe("getCurrentUser", () => {

    it("exec", () => {
        const testUser = {Name: "Userke"};
        const i = new Injector({parent: undefined});
        i.SetInstance({writeHead: () => (undefined), end: (result: string) => {
            expect(result).to.be.eq(JSON.stringify(testUser));
        }}, ServerResponse);
        i.SetInstance({getCurrentUser: async () => (testUser)}, UserContextService);
        const c = i.GetInstance(GetCurrentUser, true);
        c.exec();
    });
});
