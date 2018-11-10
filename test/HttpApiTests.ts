import { Injector } from "@furystack/inject";
import { expect } from "chai";
import { HttpApiConfiguration } from "../src";
import { HttpApi } from "../src/HttpApi";

export const httpApiTests = describe("HttpApi tests", () => {
    it("Can be constructed", () => {
        const i = new Injector({parent: undefined, owner: "Test"});
        i.SetInstance(new HttpApiConfiguration());
        i.SetInstance(i, Injector);
        const api = i.GetInstance(HttpApi, true);
        expect(api).to.be.instanceof(HttpApi);
    });

});
