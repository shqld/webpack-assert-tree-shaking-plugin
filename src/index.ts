import webpack from 'webpack';

type Compilation = webpack.compilation.Compilation & {
    findModule: (modPath: string) => Module;
};

type Module = webpack.compilation.Module & {
    request: string;
    issuer: webpack.compilation.Module & { request: string };
};

export interface ShakenModule {
    modulePath: string;
    values?: Array<string>;
}

const normalizeShakenModule = (modules: string | ShakenModule): ShakenModule =>
    typeof modules === 'string' ? { modulePath: modules } : modules;

export class WebpackAssertTreeShakingPlugin implements webpack.Plugin {
    modules: Array<ShakenModule>;

    constructor(modules: string | ShakenModule | Array<string | ShakenModule> = []) {
        if (Array.isArray(modules)) {
            this.modules = modules.map((mod) => normalizeShakenModule(mod));
        } else {
            this.modules = [normalizeShakenModule(modules)];
        }
    }

    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterEmit.tap(
            'WebpackAssertTreeShakingPlugin',
            (compilation: Compilation) => {
                this.modules.forEach((mod) => this.assert(compilation, mod));
            }
        );
    }

    assert(compilation: Compilation, { modulePath, values }: ShakenModule) {
        const mod = compilation.findModule(modulePath);

        if (!mod.usedExports) return;

        if (typeof mod.usedExports !== 'boolean' && values) {
            mod.usedExports.forEach((usedExport) => {
                values.forEach((value) => {
                    if (usedExport === value) {
                        throw new Error(this.createErrorMessage(mod, value));
                    }
                });
            });
        }

        throw new Error(this.createErrorMessage(mod));
    }

    createErrorMessage(mod: Module, used?: string) {
        const details = [
            used && ['value', used],
            ['module', mod.request],
            ['used exports', mod.usedExports],
            ['used in', mod.issuer.request],
        ].filter(Boolean);

        return [
            `(WebpackAssertTreeShakingPlugin) Tree shaking failed`,
            JSON.stringify(
                details.reduce((obj, [key, val]: any) => {
                    obj[key] = val;
                    return obj;
                }, {}),
                null,
                2
            ),
            '',
        ].join('\n');
    }
}
