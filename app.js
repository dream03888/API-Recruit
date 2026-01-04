const express = require("express");
const router = express.Router();

const { io } = require("./initial");
const appps = require("./src/applicants.js");

io.on("connection", (socket) => {
    console.log(`Socket connect id: ${socket.id}`);



   socket.on("get_getApplicants", async (page , limit) => {
        const result = await appps.getApplicants(page, limit);
        socket.emit("return_getApplicants", result);
    });


        socket.on("get_camByzone_Byid", async (camera_id) => {
        const result = await zone.getCameraByZoneByCamera(camera_id);
        socket.emit("return_camByzone_Byid", result);
    });



   socket.on("insert_interview", async (data) => {
        const result = await appps.insert_interview(data);
        socket.emit("return_insert_interview", result);
    });


   socket.on("update_interview", async (id, state) => {
        const result = await appps.update_interview(id, state);
        socket.emit("return_update_interview", result);
    });


   socket.on("get_data_interview", async () => {
        const result = await appps.getDataInterview();
        socket.emit("return_get_data_interview", result);
    });


   socket.on("req_insert_jobApplcants", async (data) => {
        const result = await appps.insert_jobsApplicants(data);
        socket.emit("return_insert_jobsApplicants", result);
    });















});