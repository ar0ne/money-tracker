import { addData, updateData, getStoreDataById, Stores } from "./db";
import { Settings } from "./model";


export class SettingsDao {

    public SETTINGS_ID: string = 'my-settings';
    
    public getAll = async () => {
        return await getStoreDataById<Settings>(Stores.Settings, this.SETTINGS_ID);
    }

    public add = async (settings: Settings) => {
        await addData(Stores.Settings, {id: this.SETTINGS_ID, last_currency_id: settings.last_currency_id});
    }

    public update = async (settings: Settings) => {
        await updateData(Stores.Settings, this.SETTINGS_ID, settings)
    }

}
