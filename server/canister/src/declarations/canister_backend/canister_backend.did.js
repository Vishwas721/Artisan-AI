export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addRecord' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getRecord' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Text)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
