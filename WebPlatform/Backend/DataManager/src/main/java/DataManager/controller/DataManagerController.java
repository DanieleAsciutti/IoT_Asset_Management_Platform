package DataManager.controller;

import DataManager.dto.UnregisteredDeviceDTO;
import DataManager.dto.asset.*;
import DataManager.dto.auth.UserDTO;
import DataManager.dto.gateway.AddUserDTO;
import DataManager.model.Role;
import DataManager.model.graphDB.Device;
import DataManager.model.relDB.User;
import DataManager.repository.AssetRepository;
import DataManager.repository.InfluxRepository;
import DataManager.repository.UserRepository;
import DataManager.service.DataManagerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequiredArgsConstructor
@Slf4j
public class DataManagerController {

    private final DataManagerService dataManagerService;

    private final AssetRepository assetRepository;

    @Autowired
    private final UserRepository userRepository;

    private final InfluxRepository influxRepository;

    private final String folderPath = "/data";

    private final String modelsPath = "/models";

    /*Come mettere più attributi in una volta
        Map<String, String> attributes = new HashMap<>();
        attributes.put("p1", "v1");
        attributes.put("p2", "v2");
        deviceRepository.setAttribute("4:c8cc96a5-c5b6-4955-a5e0-9441193527c4:9", attributes);
     */

    @PostMapping(value = "/test")
    public String test(){
        log.info("Test endpoint called");
        return dataManagerService.getModelsHistory("/data/models", "4:937e76b2-57c3-49ec-875c-1d6379c40dca:7");
    }


    @GetMapping(value = "/test2")
    public void test2(){
        log.info("Test2 endpoint called");
        /*
        deviceRepository.addDevice("test",true);
        monitoringTargetRepository.addMonitoringTarget("monTest");
        System.out.println(deviceRepository.getAllRegisteredDevices());
        System.out.println(monitoringTargetRepository.getAllMonitoringTargets());

         */
        //Map<String, String> relationship = new HashMap<>();
        //relationship.put("type", "MONITORS");
        //deviceRepository.addTargetRelationship("4:c8cc96a5-c5b6-4955-a5e0-9441193527c4:0","4:c8cc96a5-c5b6-4955-a5e0-9441193527c4:1","MONITORS");
        String deviceId = "4:c8cc96a5-c5b6-4955-a5e0-9441193527c4:0";
        String targetId = "4:c8cc96a5-c5b6-4955-a5e0-9441193527c4:1";
        //String relationship = "MONITORS";
        //deviceRepository.createRelationship(deviceId, targetId, relationship);
        //System.out.println(deviceRepository.prova(deviceId));
        //deviceRepository.addTargetRelationship(deviceId, targetId, relationship);
        String assetLabel = assetRepository.getNodeLabelById(deviceId);
        String targetLabel = assetRepository.getNodeLabelById(targetId);
        String relationship = "PROVA";
        String query = "MATCH (d:"+assetLabel+"), (t:"+targetLabel+") WHERE elementId(d) = $deviceId AND elementId(t) = $targetId CREATE (d)-[r:"+relationship+"]->(t)";
        assetRepository.addRelationship(deviceId, targetId, query);

    }

    @PostMapping(value = "/testVolume")
    public void testVolume() {
        log.info("TestVolume endpoint called");
        File directory = new File("/data");

        if (!directory.exists()) {
            log.info("Directory not found");
            return;
        }
        String folderName = "models";

        // Create the folder inside the base directory
        File folder = new File(directory, folderName);
        if (!folder.exists()) {
            folder.mkdirs(); // Create the folder
        }

        File file = new File(folder, "test.txt");
        try {
            FileWriter writer = new FileWriter(file);
            writer.write("Di nuovo ne sium dai");
            writer.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    @PostMapping(value = "/addDevice")
    public ResponseEntity<String> addDevice(@RequestParam String name){
        log.info("InsertDevice endpoint called");
        String id = assetRepository.addDevice(name, false);
        return ResponseEntity.ok(id);
    }

    @PostMapping(value = "/registerDevice")
    public ResponseEntity<Void> registerDevice(@RequestParam String assetId, @RequestBody AddDeviceDTO addDeviceDTO){
        log.info("RegisterDevice endpoint called");
        assetRepository.registerDevice(assetId, addDeviceDTO.getPlace(), addDeviceDTO.getType(), addDeviceDTO.getStatus(), LocalDate.now().toString(),
                addDeviceDTO.getLevel1(), addDeviceDTO.getLevel2(), addDeviceDTO.getLevel3());
        assetRepository.setPendingSend(assetId, false);
        assetRepository.setPendingData(assetId, false);
        assetRepository.setPendingRetrieve(assetId, false);
        assetRepository.setCurrentModel(assetId, null);
        assetRepository.setPendingModel(assetId, null);
        return ResponseEntity.ok().build();
    }

    /*

    @PostMapping(value = "/addMonitoringTarget")
    public void addMonitoringTarget(@RequestParam String name){
        log.info("InsertMonitoringTarget endpoint called");
        assetRepository.addMonitoringTarget(name);
    }

     */

    @PostMapping(value = "/addAsset")
    public ResponseEntity<Void> addAsset(@RequestBody AddAssetDTO addAssetDTO) {
        log.info("InsertAsset endpoint called");
        if (addAssetDTO.getLabel().equals("Device")) {
            return ResponseEntity.badRequest().build();
        }
        String query = "CREATE (d:"+addAssetDTO.getLabel()+" {name:$name}) SET d.isRegistered = true, d.level1 = $level1, d.level2 = $level2, d.level3 = $level3";
        assetRepository.addAsset(query, addAssetDTO.getName(), addAssetDTO.getLevel1(), addAssetDTO.getLevel2(), addAssetDTO.getLevel3());
        return ResponseEntity.ok().build();
    }


    @PostMapping(value = "/deleteAsset")
    public ResponseEntity<Void> deleteAsset(@RequestParam String id){
        log.info("DeleteAsset endpoint called");
        assetRepository.deleteAsset(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/deleteRelationship")
    public ResponseEntity<Void> deleteRelationship(@RequestParam String relId){
        log.info("DeleteRelationship endpoint called");
        assetRepository.deleteRelationship(relId);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/getAsset")
    public ResponseEntity<String> getAsset(@RequestParam String id){
        log.info("GetAsset endpoint called");
        return ResponseEntity.ok(assetRepository.getAsset(id));
    }


    @GetMapping(value = "/getAllUnregisteredDevices")
    public ResponseEntity<ArrayList<UnregisteredDeviceDTO>> getAllUnregisteredDevices(){
        log.info("GetAllUnregisteredDevices endpoint called");
        ArrayList<Device> devices = assetRepository.getAllUnregisteredDevices();
        ArrayList<UnregisteredDeviceDTO> result = new ArrayList<>();
        for(Device device : devices){
            result.add(new UnregisteredDeviceDTO(device.getId(),device.getName()));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/getAllRegisteredDevices")
    public ResponseEntity<ArrayList<String>> getAllRegisteredDevices(){
        log.info("GetAllRegisteredDevices endpoint called");
        log.info(assetRepository.getAllRegisteredDevices().toString());
        return ResponseEntity.ok(assetRepository.getAllRegisteredDevices());
    }


    @PostMapping(value = "/addAttributes")
    public ResponseEntity<Void> addAttributes(@RequestParam String assetId, @RequestBody AttributesDTO attributesDTO){
        log.info("RegisterAsset endpoint called");
        String assetLabel = assetRepository.getNodeLabelById(assetId);
        String query = "MATCH (d:"+assetLabel+") WHERE elementId(d) = $assetId SET d += $value";
        assetRepository.setAttributes(assetId, attributesDTO.getAttributes(), query);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/removeAttributes")
    public ResponseEntity<Void> removeAttributes(@RequestParam String assetId, @RequestBody NamesDTO namesDTO){
        log.info("RemoveAttributes endpoint called");
        String assetLabel = assetRepository.getNodeLabelById(assetId);
        String query = "MATCH (d:"+assetLabel+") REMOVE";
        for(String attribute : namesDTO.getAttributesName()){
            query += " d."+attribute+",";
        }
        query = query.substring(0, query.length()-1);
        assetRepository.removeAttributes(assetId, query);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/addRelationships")
    public ResponseEntity<Void> addRelationships(@RequestParam String assetId, @RequestBody RelationshipsDTO relationshipsDTO){
        //The map is: <targetId, relationshipLabel>
        log.info("AddRelationships endpoint called");
        for(Map.Entry<String, String> entry : relationshipsDTO.getRelationships().entrySet()){
            if(dataManagerService.checkNewRelationship(assetId, entry.getKey())) {
                String assetLabel = assetRepository.getNodeLabelById(assetId);
                String targetLabel = assetRepository.getNodeLabelById(entry.getKey());
                String relationship = entry.getValue();
                String query = "MATCH (d:" + assetLabel + "), (t:" + targetLabel + ") WHERE elementId(d) = $deviceId AND elementId(t) = $targetId CREATE (d)-[r:" + relationship + "]->(t)";
                assetRepository.addRelationship(assetId, entry.getKey(), query);
            }
            //TODO: si deve mettere un else che dia un errore dicendo quali relazioni non sono creabili
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/removeRelationships")
    public ResponseEntity<Void> removeRelationships(@RequestBody RelNamesDTO relNamesDTO){
        log.info("RemoveRelationships endpoint called");
        for(String relationship : relNamesDTO.getRelationships()){
            assetRepository.removeRelationship(relationship);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/getNetwork")
    public ResponseEntity<String> getNetwork(){
        log.info("GetNetwork endpoint called");
        List<String> assets = assetRepository.getAssetsForNetwork();
        List<String> relationships = assetRepository.getRelationsForNetwork();
        String toReturn = "{\"nodes\":"+assets.toString()+", \"links\":"+relationships.toString()+"}";
        return ResponseEntity.ok(toReturn);
    }

    @GetMapping(value = "/getFilteredNetwork")
    public ResponseEntity<String> getFilteredNetwork(@RequestParam String l1, @RequestParam String l2, @RequestParam String l3){
        log.info("GetFilteredNetwork endpoint called");
        List<String> assets = assetRepository.getFilteredAssetsForNetwork(l1, l2, l3);
        List<String> relationships = assetRepository.getFilteredRelationsForNetwork(l1, l2, l3);
        String toReturn = "{\"nodes\":"+assets.toString()+", \"links\":"+relationships.toString()+"}";
        return ResponseEntity.ok(toReturn);

    }

    @PostMapping(value = "/addNewModel")
    public ResponseEntity<Void> addNewModel(@RequestBody ModelDTO modelDTO){
        log.info("AddNewModel endpoint called");

        log.info(modelDTO.getAssetId());
        String path = assetRepository.retrieveModelPath(modelDTO.getAssetId());
        log.info(path);
        if(path == null) {
            path = dataManagerService.createModelFolder(folderPath + modelsPath, modelDTO.getAssetId());
            //TODO: CAPIRE SE SOSTITUIRE getAssetId con getAssetName (se gli asset hanno un nome univoco)
            assetRepository.addModelPath(modelDTO.getAssetId(), path);
        }
        //path is something like /data/models/assetId
        dataManagerService.saveModel(path, modelDTO.getModelName(),modelDTO.getModel(), modelDTO.getFromUser(), modelDTO.getAssetId());
        //TODO: CAPIRE SE SOSTITUIRE il timestamp con un modelName
        return ResponseEntity.ok().build();


        /*
                How to format the data from python:

                data = {
                    "model_name": "YourModelName",
                    "model_type": "YourModelType",
                    # Add any other data you want to send
                }

                d = pickle.dumps(data);
                model_base64 = base64.b64encode(d).decode('utf-8')

                data = {
                    "model" : model_base64,
                    "assetId": "4:937e76b2-57c3-49ec-875c-1d6379c40dca:2",
                    "fromUser" : True
                }

                response = requests.post(url, json=data)
         */
    }

    @PostMapping(value = "/modelInserted")
    public ResponseEntity<Void> modelInserted(@RequestParam String deviceId){
        log.info("ModelInserted endpoint called");
        assetRepository.setPendingSend(deviceId, false);
        String model = assetRepository.getPendingModel(deviceId);
        dataManagerService.clearFolder(folderPath + modelsPath + "/" + deviceId + "/pendingModel");
        assetRepository.setPendingModel(deviceId, null);
        assetRepository.setCurrentModel(deviceId, model);

        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/saveDeviceData")
    public ResponseEntity<Void> saveDeviceData(@RequestBody DeviceDataDTO deviceDataDTO){
        log.info("SaveDeviceData endpoint called");
        influxRepository.saveData(deviceDataDTO.getData());
        assetRepository.setPendingData(deviceDataDTO.getDeviceId(), false);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/setPendingRetrieve")
    public ResponseEntity<Void> setPendingRetrieve(@RequestParam String deviceId, @RequestParam boolean value){
        log.info("SetPendingRetrieve endpoint called");
        assetRepository.setPendingRetrieve(deviceId, value);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/setPendingData")
    public ResponseEntity<Void> setPendingData(@RequestParam String deviceId, @RequestParam boolean value){
        log.info("SetPendingData endpoint called");
        assetRepository.setPendingData(deviceId, value);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/getDeviceModelsHistory")
    public ResponseEntity<String> getDeviceModelsHistory(@RequestParam String deviceId){
        log.info("GetDeviceModelsHistory endpoint called");
        return ResponseEntity.ok(dataManagerService.getModelsHistory(folderPath + modelsPath, deviceId));
    }


    @GetMapping(value = "/getDevicePendings")
    public ResponseEntity<PendingDeviceDTO> getDevicePendings(@RequestParam String deviceId){
        log.info("GetDevicePendings endpoint called");
        JSONObject json = new JSONObject(assetRepository.getDevicePendings(deviceId));
        boolean data = json.getBoolean("data");
        boolean retrieve = json.getBoolean("retrieve");
        boolean send = json.getBoolean("send");
        return ResponseEntity.ok(new PendingDeviceDTO(data, retrieve, send));

    }

    @GetMapping(value = "/retrieveModel")
    public ResponseEntity<byte[]> retrieveModel(@RequestParam String deviceId, @RequestParam String modelName, @RequestParam boolean fromUser){
        log.info("RetrieveModel endpoint called");
        try {
            byte[] model = dataManagerService.retrieveModel(folderPath + modelsPath + "/" + deviceId, modelName, fromUser);
            return ResponseEntity.ok(model);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }

    }


    @GetMapping(value = "/getLevel1")
    public ResponseEntity<List<String>> getLevel1(){
        log.info("RetrieveLevel1 endpoint called");
        return ResponseEntity.ok(assetRepository.retrieveLevel1());
    }

    @GetMapping(value = "/getLevel2")
    public ResponseEntity<List<String>> getLevel2(@RequestParam String level1){
        log.info("RetrieveLevel2 endpoint called");
        return ResponseEntity.ok(assetRepository.retrieveLevel2(level1));
    }

    @GetMapping(value = "/getLevel3")
    public ResponseEntity<List<String>> getLevel3(@RequestParam String level1, @RequestParam String level2){
        log.info("RetrieveLevel3 endpoint called");
        System.out.println(level1 + " " + level2);
        List<String> result = assetRepository.retrieveLevel3(level1, level2);
        System.out.println(result.toString());
        return ResponseEntity.ok(assetRepository.retrieveLevel3(level1, level2));
    }



    //------- USER MANAGEMENT -------//

    @GetMapping(value = "/user")
    @ResponseBody
    public ResponseEntity<Optional<UserDTO>> getUser(@RequestParam String username) {
        log.info("GetUser endpoint called");
        Optional<User> user = userRepository.findByUsername(username);
        System.out.println(user.toString());
        return ResponseEntity.ok(user.map(UserDTO::new));
    }

    @GetMapping(value = "/users")
    @ResponseBody
    public ResponseEntity<List<UserInfoDTO>> getUsers() {
        log.info("GetUsers endpoint called");
        List<User> users = userRepository.findUsers();
        List<UserInfoDTO> result = new ArrayList<>();
        for(User user : users){
            result.add(new UserInfoDTO(user.getUsername(), user.getRole(), user.getId()));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/addUser")
    public ResponseEntity<Void> addUser(@RequestBody AddUserDTO addUserDTO){
        log.info("AddUser endpoint called");
        User user = new User(addUserDTO.getUsername(), addUserDTO.getPassword(), Role.valueOf(addUserDTO.getRole()));
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/deleteUser")
    public ResponseEntity<Void> deleteUser(@RequestParam long id){
        log.info("DeleteUser endpoint called");
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/updateUserRole")
    public ResponseEntity<Void> updateUserRole(@RequestParam long id, @RequestParam Role role){
        log.info("UpdateUser endpoint called");
        Optional<User> user = userRepository.findById(id);
        //TODO: testare se funziona quando va supabase
        if(user.isPresent()){
            user.get().setRole(role);
            userRepository.save(user.get());
            return ResponseEntity.ok().build();
        }else
            return ResponseEntity.notFound().build();
    }

    @GetMapping(value = "/getAllNodesId")
    @ResponseBody
    public ResponseEntity<List<String>> getAllNodesId(){
        log.info("GetAllNodesId endpoint called");
        return ResponseEntity.ok(assetRepository.getAllNodesId());
    }

    @GetMapping(value = "/retrieveDeviceDataMetadata")
    @ResponseBody
    public ResponseEntity<String> retrieveDeviceDataMetadata(@RequestParam String deviceId, @RequestParam String measurement) {
        log.info("RetrieveDeviceDataMetadata endpoint called");

        return ResponseEntity.ok(influxRepository.getMetadataForDevice(deviceId,measurement));
    }

    @GetMapping(value = "/retrieveDeviceDataMeasurements")
    @ResponseBody
    public ResponseEntity<String> retrieveDeviceDataMeasurements(@RequestParam String deviceId) {
        log.info("RetrieveDeviceDataMeasurements endpoint called");

        return ResponseEntity.ok(influxRepository.getMeasurementsForDevice(deviceId));
    }

    @GetMapping("/downloadDeviceData")
    public ResponseEntity<InputStreamResource> downloadDeviceData(@RequestParam String deviceId) throws IOException {
        InputStreamResource resource = influxRepository.getDeviceDataAsZip(deviceId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=device_data.zip")
                .header("X-Accel-Buffering", "no")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
