package AssetManager.controller;

import AssetManager.dto.*;
import AssetManager.service.AssetManagementService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Slf4j
public class AssetController {

    private final AssetManagementService assetManagementService;

    @PostMapping(value = "/addDevice")
    public ResponseEntity<String> addDevice(@RequestParam String name){
        log.info("AddDevice endpoint called");
        return assetManagementService.addDevice(name);
    }

    @PostMapping(value = "/addAsset")
    public ResponseEntity<Void> addAsset(@RequestParam String name,@RequestParam String label){
        log.info("AddAsset endpoint called");
        return assetManagementService.addAsset(name,label);
    }

    @GetMapping(value = "/getAsset")
    public ResponseEntity<String> getAsset(@RequestParam String id){
        log.info("GetAsset endpoint called");
        return assetManagementService.getAsset(id);
    }

    @PostMapping(value = "/deleteAsset")
    public ResponseEntity<String> deleteAsset(@RequestParam String id)
    {
        log.info("DeleteAsset endpoint called");
        return assetManagementService.deleteAsset(id);
    }

    @PostMapping(value = "/deleteRelationship")
    public ResponseEntity<Void> deleteRelationship(@RequestParam String relId){
        log.info("DeleteRelationship endpoint called");
        return assetManagementService.deleteRelationship(relId);
    }

    @PostMapping(value = "/addAttributes")
    public ResponseEntity<Void> addAttributes(@RequestParam String assetId, @RequestBody AttributesDTO attributesDTO){
        log.info("AddAttributes endpoint called");
        return assetManagementService.addAttributes(assetId,attributesDTO);
    }

    @PostMapping(value = "/removeAttributes")
    public ResponseEntity<Void> removeAttributes(@RequestParam String id, @RequestBody NamesDTO namesDTO){
        log.info("RemoveAttributes endpoint called");
        return assetManagementService.removeAttributes(id,namesDTO);
    }

    @GetMapping(value = "/getAllDevices")
    public ResponseEntity<List<String>> getAllDevices(){
        log.info("GetAllDevices endpoint called");
        return assetManagementService.getAllDevices();
    }

    @GetMapping(value = "/getAllUnregisteredDevices")
    public ResponseEntity<List<UnregisteredDeviceDTO>> getAllUnregisteredDevices(){
        log.info("GetAllUnregisteredDevices endpoint called");
        return assetManagementService.getAllUnregisteredDevices();
    }

    @GetMapping(value = "/getAllRegisteredDevices")
    public ResponseEntity<List<String>> getAllRegisteredDevices(){
        log.info("GetAllRegisteredDevices endpoint called");
        return assetManagementService.getAllRegisteredDevices();
    }

    @GetMapping(value = "/getDeviceAttributes")
    public ResponseEntity<List<String>> getDeviceAttributes(String id){
        log.info("GetDeviceAttributes endpoint called");
        return assetManagementService.getDeviceAttributes(id);
    }


    @PostMapping(value = "/registerDevice")
    public ResponseEntity<Void> registerDevice(@RequestParam String id, @RequestBody DeviceDTO deviceDTO){
        log.info("RegisterDevice endpoint called");
        return assetManagementService.registerDevice(id,deviceDTO);
    }

    @PostMapping(value = "/addRelationships")
    public ResponseEntity<Void> addRelationships(@RequestParam String assetId, @RequestBody RelationshipsDTO relationshipsDTO){
        log.info("AddRelationships endpoint called");
        return assetManagementService.addRelationships(assetId,relationshipsDTO);
    }

    @PostMapping(value = "/removeRelationships")
    public ResponseEntity<Void> removeRelationships(@RequestBody RelNamesDTO relNamesDTO){
        log.info("RemoveRelationships endpoint called");
        return assetManagementService.removeRelationships(relNamesDTO);
    }

    @GetMapping(value = "getNetwork")
    public ResponseEntity<String> getNetwork(){
        log.info("GetNetwork endpoint called");
        return assetManagementService.getNetwork();
    }

    @PostMapping(value = "/addNewModel")
    public ResponseEntity<Void> addNewModel(@RequestBody ModelDTO modelDTO){
        log.info("AddNewModel endpoint called");
        return assetManagementService.addNewModel(modelDTO);
    }

    @PostMapping(value = "/modelInserted")
    public ResponseEntity<Void> modelInserted(@RequestParam String deviceId){
        log.info("ModelInserted endpoint called");
        return assetManagementService.modelInserted(deviceId);
    }

    @PostMapping(value = "/saveDeviceData")
    public ResponseEntity<Void> saveDeviceData(@RequestBody DeviceDataDTO deviceDataDTO){
        log.info("SaveDeviceData endpoint called");
        return assetManagementService.saveDeviceData(deviceDataDTO);
    }

    @GetMapping(value = "/getDeviceModelsHistory")
    public ResponseEntity<String> getDeviceModelsHistory(@RequestParam String deviceId){
        log.info("GetDeviceModelsHistory endpoint called");
        return assetManagementService.getDeviceModelsHistory(deviceId);
    }

    @GetMapping(value = "/getDevicePendings")
    public ResponseEntity<PendingDeviceDTO> getDevicePendings(@RequestParam String deviceId) {
        log.info("GetDevicePendings endpoint called");
        return assetManagementService.getDevicePendings(deviceId);
    }

    @GetMapping(value = "/retrieveModel")
    public ResponseEntity<byte[]> retrieveModel(@RequestParam String deviceId, @RequestParam String modelName, @RequestParam Boolean fromUser){
        log.info("RetrieveModel endpoint called");
        return assetManagementService.retrieveModel(deviceId,modelName,fromUser);
    }


    @GetMapping(value = "/retrieveDeviceDataMetadata")
    public ResponseEntity<String> retrieveModel(@RequestParam String deviceId, @RequestParam String measurement){
        log.info("RetrieveDeviceDataMetadata endpoint called");
        return assetManagementService.retrieveDeviceDataMetadata(deviceId,measurement);
    }

    @GetMapping(value = "/retrieveDeviceDataMeasurements")
    public ResponseEntity<String> retrieveDeviceDataMeasurements(@RequestParam String deviceId) {
        log.info("RetrieveDeviceDataMeasurements endpoint called");
        return assetManagementService.retrieveDeviceDataMeasurements(deviceId);
    }

    @GetMapping("/downloadDeviceData")
    public ResponseEntity<InputStreamResource> downloadDeviceData(@RequestParam String deviceId) {
        log.info("DownloadDeviceData endpoint called");
        return assetManagementService.downloadDeviceData(deviceId);
    }







}
