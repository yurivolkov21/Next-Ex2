export interface Recipe {
	id: string;
	title: string;
	description: string;
	ingredients: string[];
	steps: string[];
	image_url: string | null;
	created_at: string;
}

export interface RecipeListItem extends Recipe {
	like_count: number;
}

export interface RecipeComment {
	id: string;
	recipe_id: string;
	content: string;
	created_at: string;
}

export interface CreateRecipeBody {
	title: string;
	description: string;
	ingredients: string[];
	steps: string[];
	image_url?: string;
}

export interface UpdateRecipeBody {
	title?: string;
	description?: string;
	ingredients?: string[];
	steps?: string[];
	image_url?: string;
}
