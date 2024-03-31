const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async(req,res) => {
    const allListings = await Listing.find({});
    res.render("../views/listings/index.ejs", { allListings });
};

module.exports.new = async(req,res) => {
    res.render("../views/listings/new.ejs");
};

module.exports.show = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"},}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("../views/listings/show.ejs", {listing});
};

module.exports.create = async(req,res,next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location ,
        limit: 1,
      })
        .send();

    console.log(response.body.features[0].geometry);

    let url = req.file.path;
    console.log(url);
    let filename = req.file.filename;
    console.log(filename);
    const newListing = new Listing(req.body.listing);
    console.log(req.user);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.edit = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("../views/listings/edit.ejs", {listing});
};

module.exports.update = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`);
};

module.exports.destroy = async(req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
};