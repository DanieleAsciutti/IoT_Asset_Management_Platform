package Middleware.controller;

import Middleware.dto.devices.SendDataDTO;
import Middleware.dto.devices.SendModelDTO;
import Middleware.dto.server.ModelDTO;
import Middleware.dto.server.MultipleModelsDTO;
import Middleware.model.Request;
import Middleware.model.Response;
import Middleware.service.MiddlewareService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MiddlewareController {

    private final MiddlewareService middlewareService;


    // Test to see if i can receive a pickle file and save it correctly
    @PostMapping("/test")
    public void test(@RequestBody byte[] test){
        log.info("Test");
        log.info(test.toString());
        final byte[] content = test;
        String path = "C:\\Users\\danie\\Desktop\\test.pkl";


        try (FileOutputStream fileOut = new FileOutputStream(path);
             DataOutputStream objectOut = new DataOutputStream(fileOut)) {
            objectOut.write(content);
            System.out.println("Pickle file saved successfully.");
        } catch (IOException e) {
            e.printStackTrace();
        }

        /*
        Python code to read the data from the pickle file:
        with open(pickle_file_path, 'rb') as file:
            data = pickle.load(file)
        In data we have the pickle file data.
         */
    }

    @PostMapping("/test2")
    public void test2(){
        log.info("Test2");

        try {
            File directory = new File("/middleware_data");
            if (!directory.exists()) {
                log.info("Directory not found");
                return;
            }
            // Create a File object representing the file
            File file = new File(directory,"test.txt");

            // Create a FileWriter object to write to the file
            FileWriter writer = new FileWriter(file);

            // Write the content to the file
            writer.write("content");

            // Close the writer
            writer.close();

            System.out.println("File saved successfully.");
        } catch (IOException e) {
            System.out.println("An error occurred while saving the file.");
            e.printStackTrace();
        }
    }


    @PostMapping("/test3")
    public void test3 (){
        log.info("test3");
    }

    //----------------------------------------------------------------------------------------------------------------//
    // The following endpoints are called by the Devices

    @PostMapping("/dev/addDevice")
    public ResponseEntity<Void> addDevice(@RequestParam String name){
        log.info("Add device called");
        middlewareService.asyncAddDevice(name);
        return ResponseEntity.ok().build();
    }


    /**
     * This endpoint is called by the device to open the communication
     * @param deviceName device's unique name
     * @return a String with the type of request that the device should make in order to accept the pending request
     */
    @PostMapping("/dev/openComm")
    public ResponseEntity<String> openComm(@RequestParam String deviceName){
        log.info("Open comm called");
        String request = middlewareService.checkPendingRequests(deviceName);
        log.info(request);
        return ResponseEntity.ok(request);
    }

    /*
    @PostMapping("/removeDevice")
    public ResponseEntity<Void> removeDevice(@RequestParam String deviceName){
        log.info("Remove device called");
        middlewareService.asyncRemoveDevice(deviceName);
        return ResponseEntity.ok().build();
    }

     */

    /**
     * This endpoint is called by the device to retrieve the model (is performed after the receiving of UPDATE_MODEL)
     * @param deviceName device's unique name
     * @return the model in byte[] format
     */
    @GetMapping("/dev/retrieveModel")
    public ResponseEntity<byte[]> dev_RetrieveModel(@RequestParam String deviceName){
        log.info("/dev/retrieveModel called");
        byte[] model = middlewareService.retrieveModel(deviceName);
        if(model == null){
            return ResponseEntity.notFound().build();
        }
        middlewareService.removePendingRequest(Response.UPDATE_MODEL, deviceName);
        middlewareService.modelInserted(deviceName);
        return ResponseEntity.ok(model);
    }

    /**
     * This endpoint is called by the device to send the model to the other server (is performed after the receiving of RETRIEVE_MODEL)
     * @param sendModelDTO model in byte[] format and the device's name
     * @return a ResponseEntity with no content
     */
    @PostMapping("/dev/sendModel")
    public ResponseEntity<Void> dev_SendModel(@RequestBody SendModelDTO sendModelDTO){
        log.info("Send model called");
        middlewareService.asyncSendModel(sendModelDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * This endpoint is called by the device to send the data (is performed after the receiving of RETRIEVE_DATA)
     * @param sendDataDTO device's name and data
     */
    @PostMapping("/dev/sendData")
    public ResponseEntity<Void> dev_SendData(@RequestBody SendDataDTO sendDataDTO){
        log.info("Send data endpoint called");
        middlewareService.asyncSendData(sendDataDTO);
        return ResponseEntity.ok().build();
    }


    //----------------------------------------------------------------------------------------------------------------//
    // The following endpoints are called by the other Server


    /**
     * This endpoint is called by the other server to update the model of a device
     * @param modelDTO model in byte[] format and the device's id
     * @return a ResponseEntity with no content
     */
    @PostMapping("/ser/updateModel")
    public ResponseEntity<Void> ser_UpdateModel(@RequestBody ModelDTO modelDTO){
        log.info("Update model called");
        middlewareService.updateModel(modelDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * This endpoint is called by the other server to retrieve the model of a device
     * @param deviceId device's unique id
     * @return a ResponseEntity with no content
     */
    @PostMapping("/ser/retrieveModel")
    public ResponseEntity<Void> ser_RetrieveModel(@RequestParam String deviceId){
        log.info("Retrieve model called");
        String name = middlewareService.findNameById(deviceId);
        middlewareService.addPendingRequest(new Request(name, Response.RETRIEVE_MODEL));
        return ResponseEntity.ok().build();
    }

    /**
     * This endpoint is called by the other server to retrieve the data of a device
     * @param deviceId device's unique id
     */
    @PostMapping("/ser/retrieveData")
    public ResponseEntity<Void> ser_RetrieveData(@RequestParam String deviceId){
        log.info("Retrieve data called");
        String name = middlewareService.findNameById(deviceId);
        //System.out.println("name riga 196 di MiddlewareController: " + name);
        middlewareService.addPendingRequest(new Request(name, Response.RETRIEVE_DATA));
        return ResponseEntity.ok().build();
    }

    /**
     * This endpoint is called by the other server to update the model of multiple devices
     * @param multipleModelsDTO model in byte[] format and the list of devices' ids
     * @return a ResponseEntity with no content
     */
    @PostMapping(value = "/ser/updateMultipleModels")
    public ResponseEntity<Void> ser_UpdateMultipleModels(@RequestBody MultipleModelsDTO multipleModelsDTO){
        log.info("Update multiple models called");
        for(String deviceId : multipleModelsDTO.getDeviceIds()){
            middlewareService.updateModel(new ModelDTO(multipleModelsDTO.getModel(), deviceId));
        }
        return ResponseEntity.ok().build();
    }


}