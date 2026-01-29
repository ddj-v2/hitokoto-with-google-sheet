import {
    Context, Handler, PRIV, Schema, Service, superagent, SystemModel, TokenModel, UserFacingError, ValidationError, ForbiddenError, Type,
} from 'hydrooj';

type HitokotoServiceConfig = {
    sheet_id: string,
    sheet_name: string,
    range: string,
    public_key: string
};

class hitokotoHandler extends Handler {
    private static config: HitokotoServiceConfig;
    static setConfig(c: HitokotoServiceConfig) { this.config = c; }
    async get() {
        const URL = `https://sheets.googleapis.com/v4/spreadsheets/${hitokotoHandler.config.sheet_id}/values/${hitokotoHandler.config.sheet_name}!${hitokotoHandler.config.range}?key=${hitokotoHandler.config.public_key}`;
        const res = await superagent.get(URL);
        if (res.status !== 200) {
            this.response.body = ['Failed to fetch data from Google Sheets', 'unknown'];
        }else {
            const data = res.body.values;
            if (!data || data.length === 0) {
                this.response.body = ['No data found in the specified range', 'unknown'];
            } else {
                const randomIndex = Math.floor(Math.random() * data.length);
                const hitokoto = data[randomIndex];
                this.response.body = [hitokoto[0] || 'unknown', hitokoto[1] || 'unknown'];
            }
        }
    }
}

export default class HitokotoService extends Service {
    static Config = Schema.object({
        sheet_id: Schema.string().description('ID of the Google Sheet to use for hitokoto').required(),
        sheet_name: Schema.string().description('name of the sheet within the Google Sheet document').required(),
        range: Schema.string().description('range of hitokoto to use from the Google Sheet e.g. A1:B10').required(),
        public_key: Schema.string().description('public key for accessing the Google Sheet').required(),
    });

    constructor(ctx: Context, config: ReturnType<typeof HitokotoService.Config>) {
        super(ctx, 'hydrooj-hitokoto-google-sheet');
        hitokotoHandler.setConfig(config);
        ctx.Route('hitokoto', '/hitokoto', hitokotoHandler);
    }
}