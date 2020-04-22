const router = require('express').Router();
const controller = require('../controllers');

router.get('/messages',(req,res)=>{
    controller.NbMessageParConv(req,res);
});

router.post("/message",(req,res)=>{
    controller.postMessage(req,res);
});

router.get("/numberOfUsers/:room",(req,res)=>{
    controller.nbPersParConv(req,res);
});

router.get("/users",(req,res)=>{
    controller.nbPersParConv(req,res);
});

router.get("/message/countTotal",(req,res)=>{
    controller.NbMessageTotal(req,res);
})

module.exports=router;
