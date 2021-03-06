var router = require('express').Router();
var config = require('../../config');
var express_jwt = require('express-jwt');
var mongoose = require('mongoose');
var Agenda = mongoose.model('Agenda');
var Contact = mongoose.model('Contact');
var crud = require('./helpers/crud');
var async = require('async');

router.use('/', express_jwt({ secret: config.JWT_SECRET }));

router.patch('/:agenda_id/addContact/:contact_id',
    function(req, res, next) {
        Contact.findOne({ _id: req.params.contact_id }, function(err, result) {
            if (err) res.status(500).json(err);
            else if (result) next();
            else res.status(404).send("Contact doesn't exist");
        });
    },
    function(req, res) {
        Agenda.findByIdAndUpdate(req.params.agenda_id, { $push: { "contacts": req.params.contact_id } }, { new: true, safe: true }, function(err, result) {
            if (err) res.status(500).json(err);
            else res.status(200).json(result);
        });
    }
);

router.patch('/:agenda_id/addContact',
    function(req, res) {
        Agenda.findByIdAndUpdate(req.params.agenda_id, { $push: { "contacts": req.body.contact_id } }, { new: true, safe: true }, function(err, result) {
            if (err) res.status(500).json(err);
            else res.status(200).json(result);
        });
    }
);

router.patch('/:agenda_id/removeContact',
    function(req, res) {
        Agenda.findByIdAndUpdate(req.params.agenda_id, { $pull: { "contacts": req.body.contact_id } }, { new: true, safe: true }, function(err, result) {
            if (err) res.status(500).json(err);
            else res.status(200).json(result);
        });
    }
);

router.get('/byname/:name',
    function(req, res) {
        Agenda.findOne({ user: req.user._id, name: req.params.name }, function(err, result){
            if(err) res.status(500).json(err);
            else {
                res.status(200).json(result);
            }
        }).populate('user contacts');
    });

crud.complete(router, Agenda, 'user contacts');

router.use(function(req, res) {
    res.status(404).send("Wrong url");
});



module.exports = router;