import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'dairy_token';
const USER_KEY  = 'dairy_user';

export const saveToken    = (t: string)  => AsyncStorage.setItem(TOKEN_KEY, t);
export const getToken     = ()           => AsyncStorage.getItem(TOKEN_KEY);
export const saveUser     = (u: object)  => AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
export const getSavedUser = async () => { const r = await AsyncStorage.getItem(USER_KEY); return r ? JSON.parse(r) : null; };
export const clearAll     = ()           => AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
