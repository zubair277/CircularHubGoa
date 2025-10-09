export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
	public: {
		Tables: {
			users: {
				Row: {
					id: number;
					created_at: string | null;
					email: string | null;
					businessName: string | null;
					businessType: string | null;
					location: string | null;
					latitude: number | null;
					longitude: number | null;
					phone: string | null;
					avatar: string | null;
				};
				Insert: {
					id?: number;
					created_at?: string | null;
					email?: string | null;
					businessName?: string | null;
					businessType?: string | null;
					location?: string | null;
					latitude?: number | null;
					longitude?: number | null;
					phone?: string | null;
					avatar?: string | null;
				};
				Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
				Relationships: [];
			};

			listings: {
				Row: {
					id: number;
					user_id: number;
					title: string | null;
					description: string | null;
					category: string | null;
					quantity: number | null;
					unit: string | null;
					location: string | null;
					latitude: number | null;
					longitude: number | null;
					availability: string | null;
					listing_type: string | null;
					status: string | null;
					image_url: string | null;
					created_at: string | null;
					updated_at: string | null;
				};
				Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at" | "updated_at"> & {
					id?: number; created_at?: string | null; updated_at?: string | null;
				};
				Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
				Relationships: [
					{ foreignKeyName: "listings_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"]; }
				];
			};

			claims: {
				Row: {
					id: number;
					listing_id: number;
					claimer_id: number;
					owner_id: number;
					message: string | null;
					status: string | null;
					created_at: string | null;
					updated_at: string | null;
				};
				Insert: Omit<Database["public"]["Tables"]["claims"]["Row"], "id" | "created_at" | "updated_at"> & {
					id?: number; created_at?: string | null; updated_at?: string | null;
				};
				Update: Partial<Database["public"]["Tables"]["claims"]["Insert"]>;
				Relationships: [
					{ foreignKeyName: "claims_listing_id_fkey"; columns: ["listing_id"]; referencedRelation: "listings"; referencedColumns: ["id"]; },
					{ foreignKeyName: "claims_claimer_id_fkey"; columns: ["claimer_id"]; referencedRelation: "users"; referencedColumns: ["id"]; },
					{ foreignKeyName: "claims_owner_id_fkey"; columns: ["owner_id"]; referencedRelation: "users"; referencedColumns: ["id"]; }
				];
			};

			messages: {
				Row: {
					id: number;
					sender_id: number;
					receiver_id: number;
					content: string | null;
					realted_claim_id: number | null;
					created_at: string | null;
				};
				Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at"> & { id?: number; created_at?: string | null; };
				Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
				Relationships: [];
			};

			pickups: {
				Row: {
					id: number;
					claim_id: number;
					created_at: string | null;
					status: string | null;
					waste_weight: number | null;
					value_saved: number | null;
					notes: string | null;
					scheduled_date: string | null;
					completed_at: string | null;
				};
				Insert: Omit<Database["public"]["Tables"]["pickups"]["Row"], "id" | "created_at"> & { id?: number; created_at?: string | null; };
				Update: Partial<Database["public"]["Tables"]["pickups"]["Insert"]>;
				Relationships: [
					{ foreignKeyName: "pickups_claim_id_fkey"; columns: ["claim_id"]; referencedRelation: "claims"; referencedColumns: ["id"]; }
				];
			};

			forum_posts: {
				Row: {
					id: number;
					user_id: number;
					title: string | null;
					content: string | null;
					category: string | null;
					created_at: string | null;
					updated_at: string | null;
				};
				Insert: Omit<Database["public"]["Tables"]["forum_posts"]["Row"], "id" | "created_at" | "updated_at"> & {
					id?: number; created_at?: string | null; updated_at?: string | null;
				};
				Update: Partial<Database["public"]["Tables"]["forum_posts"]["Insert"]>;
				Relationships: [
					{ foreignKeyName: "forum_posts_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"]; }
				];
			};

			forum_replies: {
				Row: {
					id: number;
					post_id: number;
					user_id: number;
					content: string | null;
					created_at: string | null;
				};
				Insert: Omit<Database["public"]["Tables"]["forum_replies"]["Row"], "id" | "created_at"> & { id?: number; created_at?: string | null; };
				Update: Partial<Database["public"]["Tables"]["forum_replies"]["Insert"]>;
				Relationships: [
					{ foreignKeyName: "forum_replies_post_id_fkey"; columns: ["post_id"]; referencedRelation: "forum_posts"; referencedColumns: ["id"]; },
					{ foreignKeyName: "forum_replies_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"]; }
				];
			};
		};
		Views: {};
		Functions: {};
		Enums: {};
	};
}
