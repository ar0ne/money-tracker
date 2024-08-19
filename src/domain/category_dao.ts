import { getStoreData, addData, updateData, Stores } from "./db";
import { Category } from "./model";


export class CategoryDao {

    public getAll = async (all: boolean = false) => {
        let categories: Category[] = await getStoreData<Category>(Stores.Categories);
        if (!all) {
            // hide removed categories
            categories = categories.filter((c) => !c.is_removed);
        }
        return categories.sort((a, b) => a.name.localeCompare(b.name));
    }

    public add = async (category: Category) => {
        await addData(Stores.Categories, category);
    }

    public update = async (category: Category) => {
        await updateData(Stores.Categories, category.id, category)
    }
}
