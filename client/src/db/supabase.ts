import { createClient } from "@supabase/supabase-js";



const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;



/**

 * The current application uses the Render API/MySQL backend. Some legacy pages

 * still import this module, so an absent Supabase configuration must not crash

 * the entire React bundle during module initialization.

 */

const createUnavailableClient = () => {
            
  const unavailable = async () => ({ data: null, error: new Error("Supabase is not configured") });
            
  const chain = () => {
              
    const query: any = {
                
      select: () => query,
                
      eq: () => query,
                
      single: unavailable,
                
      update: () => query,
                
      insert: () => query,
                
      delete: () => query,
                
      order: () => query,
                
      limit: () => query,
                
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(unavailable()).then(resolve),
                
    };
              
    return query;
              
  };
            

            
  return {
              
    auth: {
                
      getSession: async () => ({ data: { session: null }, error: null }),
                
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
                
      signOut: async () => ({ error: null }),
                
    },
              
    from: chain,
              
    rpc: unavailable,
              
    storage: { from: () => ({ upload: unavailable, createSignedUrl: unavailable }) },
              
  } as any;
            
};



export const supabase = supabaseUrl && supabaseAnonKey

  ? createClient(supabaseUrl, supabaseAnonKey)
            
  : createUnavailableClient();





























