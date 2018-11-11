import { IApi, LoggerCollection } from "@furystack/core";
import { Constructable, Injectable, Injector } from "@furystack/inject";
import { usingAsync } from "@sensenet/client-utils";
import { IncomingMessage, ServerResponse } from "http";
import { Server } from "net";
import { HttpApiConfiguration } from "./";
import { IRequestAction } from "./Models";
import { Utils } from "./Utils";

@Injectable()
export class HttpApi implements IApi {

    public readonly LogScope = "@furystack/http-api/HttpApi";

    public async mainRequestListener(incomingMessage: IncomingMessage, serverResponse: ServerResponse) {
        await usingAsync(new Injector({parent: this.injector, owner: IncomingMessage}), async (injector) => {
            try {
                injector.SetInstance(incomingMessage);
                injector.SetInstance(serverResponse);
                this.utils.addCorsHeaders(this.options.corsOptions, incomingMessage, serverResponse);
                const actionCtors = this.options.actions.map((a) => a(incomingMessage)).filter((a) => a !== undefined) as Array<Constructable<IRequestAction>>;
                if (actionCtors.length > 1) {
                    this.logger.Error({
                        scope: this.LogScope,
                        message: `Multiple HTTP actions found that can be execute the request`,
                        data: {
                            incomingMessage,
                        },
                    });
                }
                if (actionCtors.length === 1) {
                    const actionCtor = actionCtors[0];
                    await usingAsync(injector.GetInstance(actionCtor, true), async (action) => {
                        await action.exec();
                    });
                } else {
                    await usingAsync(injector.GetInstance(this.options.notFoundAction), async (a) => {
                        a.exec();
                    });
                }
            } catch (error) {
                await usingAsync(injector.GetInstance(this.options.errorAction), async (e) => {
                    await e.returnError(error);
                });
            }

        });
    }

    public async activate() {
        this.server.listen(this.options.port, this.options.hostName, 8192);
    }
    public dispose() {
        this.server.close();
    }

    public readonly server: Server;
    private readonly injector: Injector;

    constructor(
        parentInjector: Injector,
        private readonly options: HttpApiConfiguration,
        private logger: LoggerCollection,
        private utils: Utils,
    ) {
        this.server = this.options.serverFactory(this.mainRequestListener.bind(this));
        this.injector = new Injector({parent: parentInjector});
    }
}
