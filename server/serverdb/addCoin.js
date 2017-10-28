
import { Currencies } from '../../lib/database/Currencies.js';

if (Meteor.isServer) {
Meteor.methods({
  addCoin(data) {
  //Check that user is logged in
  if (!Meteor.userId()) {throw new Meteor.Error("Please log in first")};

   //Initialize arrays to store which data.<item>s pass or fail validation
    var allowed = [];
    var error = [];

    //Function to validate data (checkSanity)
    var checkSanity = function (value, name, type, minAllowed, maxAllowed, nullAllowed) {
      if (type == "object") {
        if (typeof value == type && _.size(value) >= minAllowed && _.size(value) <= maxAllowed) {
          allowed.push(name);
          return true;
        } else { error.push(name); return false; }
      }
      if (typeof value == type && value.toString().length >= minAllowed && value.toString().length <= maxAllowed) {
        allowed.push(name);
        return true;
      } else if (!value && nullAllowed) {
        allowed.push(name);
        return true;
      } else {
        error.push(name);
        return false;
      }
    } //END checkSanity



    //Get coin status and type for dependent validation
    var altcoin = false;
    var proposal = false;
    var btcfork = false;
    var ico = false;
    for (i in data.launchTags) {if (data.launchTags[i].tag == "Altcoin") {altcoin = true}};
    for (i in data.launchTags) {if (data.launchTags[i].tag == "proposal") {proposal = true}};
    for (i in data.launchTags) {if (data.launchTags[i].tag == "Bitcoin Fork") {btcfork = true}};
    for (i in data.launchTags) {if (data.launchTags[i].tag == "ICO") {ico = true}};

    //compulsory checks
    checkSanity(data.launchTags, "launchTags", "object", 1, 3);
    checkSanity(data.currencyName, "currencyName", "string", 3, 20);
    checkSanity(data.currencySymbol, "currencySymbol", "string", 2, 5);
    checkSanity(data.premine, "premine", "number", 1, 15);
    checkSanity(data.maxCoins, "maxCoins", "number", 4, 18);
    checkSanity(data.gitRepo, "gitRepo", "string", 18, 300);
    checkSanity(data.officialSite, "officialSite", "string", 6, 200);
    checkSanity(data.featureTags, "featureTags", "object", 0, 50);

    //Check the self-populating dropdowns
    if (data.consensusSecurity != "--Select One--") {
      checkSanity(data.consensusSecurity, "consensusSecurity", "string", 6, 20);
      } else {error.push("consensusSecurity")};
    if (data.hashAlgorithm) { if (data.hashAlgorithm != "--Select One--") {
      checkSanity(data.hashAlgorithm, "hashAlgorithm", "string", 3, 40, true);
    }} else { error.push("hashAlgorithm")};

    //Check thing that are always optional
    checkSanity(data.reddit, "reddit", "string", 12, 300, true);
    checkSanity(data.approvalNotes, "approvalNotes", "string", 0, 1000, true);

    //If this is a normal altcoin that already exists:
    if (altcoin && !proposal) {
      checkSanity(data.previousNames, "previousNames", "object", 0, 5);
      checkSanity(data.genesisTimestamp, "genesisTimestamp", "number", 13, 16);
      if (data.genesisTimestamp != 0) { if (data.genesisTimestamp < 1231006505000) {
        error.push("genesisTimestamp");
        allowed = allowed.filter(function(i) {return i != "genesisTimestamp"})
      }}
    }
//If the coin exists, no matter what it is
    if (altcoin && proposal) {
      checkSanity(data.genesisTimestamp, "intendedLaunch", "number", 13, 16);
      if (data.genesisTimestamp < 1509032068000) {
        error.push("genesisTimestamp");
        allowed = allowed.filter(function(i) {return i != "genesisTimestamp"})
      }
    }


    //If this is an ICO that already exists
    if (ico && !proposal) {
      checkSanity(data.ICOfundsRaised, "ICOfundsRaised", "number", 1, 15);
      checkSanity(data.icocurrency, "icocurrency", "string", 3, 3);
      if (data.premine < 1000) {
        error.push("premine");
        allowed = allowed.filter(function(i) {return i != "premine"})
      };
    }
    //If this is a bitcoin fork (planned or existing)
    if (btcfork) {
      checkSanity(data.forkParent, "forkParent", "string", 15, 20);
      checkSanity(data.forkHeight, "forkHeight", "number", 6, 6);
    }
    //If this is not proposal
    if (!proposal) {
      checkSanity(data.exchanges, "exchanges", "object", 0, 15);
      checkSanity(data.blockTime, "blockTime", "number", 1, 4);
      checkSanity(data.confirmations, "confirmations", "number", 1, 4);
    }





    //Check that no one is playing silly buggers trying to put extra malicious crap into the data
    //for (item in data) {
    console.log("data: " + _.size(data));
    console.log(data);

      console.log("allowed: " + _.size(allowed));
      console.log(allowed);

      console.log("errors: " + _.size(error));
      console.log(error);

      console.log("unprocessed inputs: ", _.size(data) - (_.size(allowed) + _.size(error)));
      console.log("-----------------");
      //if(allowed.includes(data[item].)
  //  }





  if (error.length != 0) {throw new Meteor.Error(error)}
  if(error.length == 0 && _.size(data) == _.size(allowed)){
    console.log("----inserting------");
    var insert = _.extend(data, {
      createdAt: new Date().getTime(),
      approved: false,
      owner: Meteor.userId(),
      username: Meteor.user().username
    })
    Currencies.insert(insert, function(error, result){
    if (!result) {
    console.log(error);
    //return error;
    throw new Meteor.Error('Invalid', error);
    } else {
      //console.log(error);
      console.log(result);
      return "OK";
    }
    });
  } else {console.log("did not run insert function")}



  }
});
}
