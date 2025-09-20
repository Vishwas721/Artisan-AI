import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

persistent actor {
  // Variable to store the records, declared as 'stable' to persist data
  stable var records : [Text] = [];

  // Your new function to add a record
  public func addRecord(story : Text) : async Text {
    let id = records.size();
    // Use Array.append to add the new story to the array
    records := Array.append(records, [story]);
    // Return a formatted Text ID like "ART-CERT-0"
    return "ART-CERT-" # Nat.toText(id);
  };

  // A function to get a specific record by its index
  public query func getRecord(id: Nat) : async ?Text {
     if (id < records.size()) {
       return ?records[id];
     } else {
       return null;
     };
  };
}