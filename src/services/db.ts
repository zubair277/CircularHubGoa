import { supabase } from "../lib/supabaseClient";
import type { Database } from "../types/supabase";

// USERS
export async function getUser(id: number) {
	return supabase.from("users").select("*").eq("id", id).single();
}

// LISTINGS
export async function listListings(params?: { category?: string; userId?: number }) {
	let q = supabase.from("listings").select("*").order("created_at", { ascending: false });
	if (params?.category) q = q.eq("category", params.category);
	if (params?.userId) q = q.eq("user_id", params.userId);
	return q;
}

export async function createListing(payload: Database["public"]["Tables"]["listings"]["Insert"]) {
	return supabase.from("listings").insert(payload).select().single();
}

export async function updateListingStatus(id: number, status: string) {
	return supabase.from("listings").update({ status }).eq("id", id);
}

// CLAIMS
export async function createClaim(payload: Database["public"]["Tables"]["claims"]["Insert"]) {
	return supabase.from("claims").insert(payload).select().single();
}

export async function setClaimStatus(id: number, status: string) {
	return supabase.from("claims").update({ status }).eq("id", id);
}

// MESSAGES
export async function sendMessage(payload: Database["public"]["Tables"]["messages"]["Insert"]) {
	return supabase.from("messages").insert(payload).select().single();
}

export async function getThreadMessages(userA: number, userB: number) {
	return supabase
		.from("messages")
		.select("*")
		.or(`and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`)
		.order("created_at", { ascending: true });
}

// PICKUPS
export async function schedulePickup(payload: Database["public"]["Tables"]["pickups"]["Insert"]) {
	return supabase.from("pickups").insert(payload).select().single();
}

export async function completePickup(
	id: number,
	data: { waste_weight?: number; value_saved?: number; notes?: string }
) {
	return supabase
		.from("pickups")
		.update({ status: "completed", completed_at: new Date().toISOString(), ...data })
		.eq("id", id);
}

// FORUM
export async function createPost(payload: Database["public"]["Tables"]["forum_posts"]["Insert"]) {
	return supabase.from("forum_posts").insert(payload).select().single();
}

export async function replyToPost(payload: Database["public"]["Tables"]["forum_replies"]["Insert"]) {
	return supabase.from("forum_replies").insert(payload).select().single();
}


