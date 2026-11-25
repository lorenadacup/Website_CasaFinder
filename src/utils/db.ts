/**
 * CasaFinder Database Service
 * Handles all Supabase operations for users and properties
 */

import { supabase } from './supabase';
import { Property } from '../data/properties';

// ─── USER TYPES ───────────────────────────────────────────────────────────────

export interface DbUser {
  id?: string;
  username: string;
  name: string;
  role: 'student' | 'landlord' | 'admin';
  password?: string;
  email?: string;
  mobile?: string;
  school?: string;
  bio?: string;
  address?: string;
  emergency_contact?: string;
  avatar?: string;
  facebook?: string;
  facebook_link?: string;
  permit_no?: string;
  permit_file?: string;
  permit_status?: string;
  account_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  age?: string;
  gender?: string;
  occupation?: string;
  pref_location?: string;
  pref_type?: string;
  budget_min?: string;
  budget_max?: string;
  occupants?: string;
  move_in?: string;
  stay_duration?: string;
  pets?: string;
  smoking?: string;
  business_name?: string;
  years_operation?: string;
}

// ─── USER HELPERS ─────────────────────────────────────────────────────────────

/** Convert DB row to app user shape */
export function dbToAppUser(row: any) {
  return {
    username: row.username,
    name: row.name,
    role: row.role as 'student' | 'landlord' | 'admin',
    password: row.password,
    email: row.email || '',
    mobile: row.mobile || '',
    school: row.school || '',
    bio: row.bio || '',
    address: row.address || '',
    emergencyContact: row.emergency_contact || '',
    avatar: row.avatar || '',
    facebook: row.facebook || '',
    facebookLink: row.facebook_link || '',
    permitNo: row.permit_no || '',
    permitFile: row.permit_file || '',
    permitStatus: row.permit_status || '',
    accountStatus: (row.account_status || 'approved') as 'pending' | 'approved' | 'rejected',
    rejectionReason: row.rejection_reason || '',
    age: row.age || '',
    gender: row.gender || '',
    occupation: row.occupation || '',
    prefLocation: row.pref_location || '',
    prefType: row.pref_type || '',
    budgetMin: row.budget_min || '',
    budgetMax: row.budget_max || '',
    occupants: row.occupants || '1',
    moveIn: row.move_in || '',
    stayDuration: row.stay_duration || '',
    pets: row.pets || '',
    smoking: row.smoking || '',
    businessName: row.business_name || '',
    yearsOperation: row.years_operation || '',
  };
}

/** Convert app user to DB row shape */
export function appUserToDb(user: any): DbUser {
  return {
    username: user.username,
    name: user.name,
    role: user.role,
    password: user.password,
    email: user.email || '',
    mobile: user.mobile || '',
    school: user.school || '',
    bio: user.bio || '',
    address: user.address || '',
    emergency_contact: user.emergencyContact || '',
    avatar: user.avatar || '',
    facebook: user.facebook || '',
    facebook_link: user.facebookLink || '',
    permit_no: user.permitNo || '',
    permit_file: user.permitFile || '',
    permit_status: user.permitStatus || '',
    account_status: user.accountStatus || 'approved',
    rejection_reason: user.rejectionReason || '',
    age: user.age || '',
    gender: user.gender || '',
    occupation: user.occupation || '',
    pref_location: user.prefLocation || '',
    pref_type: user.prefType || '',
    budget_min: user.budgetMin || '',
    budget_max: user.budgetMax || '',
    occupants: user.occupants || '1',
    move_in: user.moveIn || '',
    stay_duration: user.stayDuration || '',
    pets: user.pets || '',
    smoking: user.smoking || '',
    business_name: user.businessName || '',
    years_operation: user.yearsOperation || '',
  };
}

// ─── USER OPERATIONS ──────────────────────────────────────────────────────────

export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return (data || []).map(dbToAppUser);
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  if (error) return null;
  return dbToAppUser(data);
}

export async function createUser(user: any) {
  const { error } = await supabase
    .from('users')
    .insert(appUserToDb(user));
  if (error) throw error;
}

export async function updateUser(username: string, updates: any) {
  const dbUpdates = appUserToDb({ username, ...updates });
  const { error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('username', username);
  if (error) throw error;
}

export async function upsertUser(user: any) {
  const { error } = await supabase
    .from('users')
    .upsert(appUserToDb(user), { onConflict: 'username' });
  if (error) throw error;
}

// ─── PROPERTY HELPERS ─────────────────────────────────────────────────────────

export function dbToAppProperty(row: any): Property {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    type: row.type,
    beds: row.beds,
    baths: row.baths,
    sqft: row.sqft,
    address: row.address || '',
    city: row.city || 'Gumaca',
    neighborhood: row.neighborhood || '',
    description: row.description || '',
    image: row.image || '',
    features: row.features || [],
    tags: row.tags || [],
    yearBuilt: row.year_built || 2020,
    parking: row.parking || 'No Parking',
    heating: row.heating || 'Electric Fan',
    coordinates: row.coordinates || { x: 0, y: 0 },
    genderPolicy: row.gender_policy || 'Both',
    reviews: row.reviews || [],
    landlordUsername: row.landlord_username || '',
    landlordName: row.landlord_name || '',
    landlordMobile: row.landlord_mobile || '',
    landlordEmail: row.landlord_email || '',
    landlordFacebook: row.landlord_facebook || '',
    landlordAvatar: row.landlord_avatar || '',
    landlordBio: row.landlord_bio || '',
    landlordPermits: row.landlord_permits || {},
    approvalStatus: row.approval_status || 'pending',
    rejectionReason: row.rejection_reason || '',
  };
}

export function appPropertyToDb(p: Property) {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    type: p.type,
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft,
    address: p.address || '',
    city: p.city || 'Gumaca',
    neighborhood: p.neighborhood || '',
    description: p.description || '',
    image: p.image || '',
    features: p.features || [],
    tags: p.tags || [],
    year_built: p.yearBuilt || 2020,
    parking: p.parking || 'No Parking',
    heating: p.heating || 'Electric Fan',
    coordinates: p.coordinates || { x: 0, y: 0 },
    gender_policy: p.genderPolicy || 'Both',
    reviews: p.reviews || [],
    landlord_username: p.landlordUsername || '',
    landlord_name: p.landlordName || '',
    landlord_mobile: p.landlordMobile || '',
    landlord_email: p.landlordEmail || '',
    landlord_facebook: p.landlordFacebook || '',
    landlord_avatar: p.landlordAvatar || '',
    landlord_bio: p.landlordBio || '',
    landlord_permits: p.landlordPermits || {},
    approval_status: p.approvalStatus || 'pending',
    rejection_reason: p.rejectionReason || '',
  };
}

// ─── PROPERTY OPERATIONS ──────────────────────────────────────────────────────

export async function getAllProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToAppProperty);
}

export async function upsertProperty(property: Property) {
  const { error } = await supabase
    .from('properties')
    .upsert(appPropertyToDb(property), { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function updatePropertyApproval(
  id: string,
  status: 'approved' | 'rejected',
  reason?: string
) {
  const { error } = await supabase
    .from('properties')
    .update({ approval_status: status, rejection_reason: reason || '' })
    .eq('id', id);
  if (error) throw error;
}

export async function updatePropertyReviews(id: string, reviews: any[]) {
  const { error } = await supabase
    .from('properties')
    .update({ reviews })
    .eq('id', id);
  if (error) throw error;
}

// ─── REAL-TIME SUBSCRIPTIONS ──────────────────────────────────────────────────

export function subscribeToProperties(callback: (properties: Property[]) => void) {
  const channel = supabase
    .channel('properties-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'properties' },
      async () => {
        const properties = await getAllProperties();
        callback(properties);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribeToUsers(callback: (users: any[]) => void) {
  const channel = supabase
    .channel('users-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users' },
      async () => {
        const users = await getAllUsers();
        callback(users);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
