package DataManager.controller;

import DataManager.dto.UnregisteredDeviceDTO;
import DataManager.dto.asset.*;
import DataManager.dto.auth.UserDTO;
import DataManager.dto.enums.Warning;
import DataManager.dto.gateway.*;
import DataManager.dto.gateway.warnings.*;
import DataManager.model.Role;
import DataManager.model.graphDB.Device;
import DataManager.model.relDB.AnomalyWarningCase;
import DataManager.model.relDB.RULWarningCase;
import DataManager.model.relDB.User;
import DataManager.repository.*;
import DataManager.service.DataManagerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.json.JSONObject;
import org.neo4j.driver.exceptions.ClientException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;

@RestController
@RequiredArgsConstructor
@Slf4j
public class DataManagerController {

    private final DataManagerService dataManagerService;

    private final AssetRepository assetRepository;

    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private final AnomalyWarningCaseRepository anomalyWarningCaseRepository;

    @Autowired
    private final RLUWarningCaseRepository rluWarningCaseRepository;

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
    public String test() {
        log.info("Test endpoint called");
        return dataManagerService.getModelsHistory("/data/models", "4:937e76b2-57c3-49ec-875c-1d6379c40dca:7");
    }


    @GetMapping(value = "/test2")
    public void test2() {
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
        String query = "MATCH (d:" + assetLabel + "), (t:" + targetLabel + ") WHERE elementId(d) = $deviceId AND elementId(t) = $targetId CREATE (d)-[r:" + relationship + "]->(t)";
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
    public ResponseEntity<String> addDevice(@RequestParam String name) {
        log.info("InsertDevice endpoint called");
        String id = assetRepository.addDevice(name, false);
        return ResponseEntity.ok(id);
    }

    @PostMapping(value = "/registerDevice")
    public ResponseEntity<Void> registerDevice(@RequestParam String assetId, @RequestBody AddDeviceDTO addDeviceDTO) {
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

    @PostMapping(value = "/addAsset")
    public ResponseEntity<Void> addAsset(@RequestBody AddAssetDTO addAssetDTO) {
        log.info("InsertAsset endpoint called");
        if (addAssetDTO.getLabel().equals("Device")) {
            return ResponseEntity.badRequest().build();
        }
        String query = "CREATE (d:" + addAssetDTO.getLabel() + " {name:$name}) SET d.isRegistered = true, d.level1 = $level1, d.level2 = $level2, d.level3 = $level3";
        assetRepository.addAsset(query, addAssetDTO.getName(), addAssetDTO.getLevel1(), addAssetDTO.getLevel2(), addAssetDTO.getLevel3());
        return ResponseEntity.ok().build();
    }


    @PostMapping(value = "/deleteAsset")
    public ResponseEntity<String> deleteAsset(@RequestParam String id){
        log.info("DeleteAsset endpoint called");
        String assetLabel = assetRepository.getNodeLabelById(id);
        try {
            assetRepository.deleteAsset(id);
        } catch (ClientException e) {
            return ResponseEntity.notFound().build();
        }
        if(assetLabel.equals("Device")){
            try {
                FileUtils.deleteDirectory(new File(folderPath + modelsPath + "/" + id));
            } catch (IOException e) {
                return ResponseEntity.internalServerError().build();
            }

        }

        return ResponseEntity.ok(assetLabel);
    }

    @PostMapping(value = "/deleteRelationship")
    public ResponseEntity<Void> deleteRelationship(@RequestParam String relId) {
        log.info("DeleteRelationship endpoint called");
        assetRepository.deleteRelationship(relId);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/getAsset")
    public ResponseEntity<String> getAsset(@RequestParam String id) {
        log.info("GetAsset endpoint called");
        return ResponseEntity.ok(assetRepository.getAsset(id));
    }


    @GetMapping(value = "/getAllUnregisteredDevices")
    public ResponseEntity<ArrayList<UnregisteredDeviceDTO>> getAllUnregisteredDevices() {
        log.info("GetAllUnregisteredDevices endpoint called");
        ArrayList<Device> devices = assetRepository.getAllUnregisteredDevices();
        ArrayList<UnregisteredDeviceDTO> result = new ArrayList<>();
        for (Device device : devices) {
            result.add(new UnregisteredDeviceDTO(device.getId(), device.getName()));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/getAllRegisteredDevices")
    public ResponseEntity<ArrayList<String>> getAllRegisteredDevices() {
        log.info("GetAllRegisteredDevices endpoint called");
//        log.info(assetRepository.getAllRegisteredDevices().toString());
        return ResponseEntity.ok(assetRepository.getAllRegisteredDevices());
    }

    @GetMapping(value = "/getFilteredRegisteredDevices")
    public ResponseEntity<ArrayList<String>> getFilteredRegisteredDevices(@RequestParam String l1, @RequestParam String l2, @RequestParam String l3) {
        log.info("GetFilteredRegisteredDevices endpoint called");
        return ResponseEntity.ok(assetRepository.getFilteredRegisteredDevices(l1, l2, l3));
    }


    @PostMapping(value = "/addAttributes")
    public ResponseEntity<Void> addAttributes(@RequestParam String assetId, @RequestBody AttributesDTO attributesDTO) {
        log.info("AddAttributes endpoint called");
        String assetLabel = assetRepository.getNodeLabelById(assetId);
        String query = "MATCH (d:" + assetLabel + ") WHERE elementId(d) = $assetId SET d += $value";
        Map<String, String> toPut = new HashMap<>();
        for (Map.Entry<String, String> entry : attributesDTO.getAttributes().entrySet()) {
            if (!entry.getKey().equals("tag")) {
                toPut.put(entry.getKey(), entry.getValue());
            }
        }
        assetRepository.setAttributes(assetId, toPut, query);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/removeAttributes")
    public ResponseEntity<Void> removeAttributes(@RequestParam String assetId, @RequestBody NamesDTO namesDTO) {
        log.info("RemoveAttributes endpoint called");
        String assetLabel = assetRepository.getNodeLabelById(assetId);
        String query = "MATCH (d:" + assetLabel + ") REMOVE";
        for (String attribute : namesDTO.getAttributes()) {
            query += " d." + attribute + ",";
        }
        query = query.substring(0, query.length() - 1);
        assetRepository.removeAttributes(assetId, query);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/modifyDeviceTag")
    public ResponseEntity<Void> modifyDeviceTag(@RequestBody DeviceTagDTO deviceTagDTO) {
        log.info("ModifyTag endpoint called");
        String query;
        if (deviceTagDTO.getTag() == null) {
            query = "MATCH (d:Device) WHERE elementId(d) = $id REMOVE d.tag";
        } else {
            query = "MATCH (d:Device) WHERE elementId(d) = $id SET d.tag=\"" + deviceTagDTO.getTag() + "\"";
        }
        if(deviceTagDTO.getTag() != null && deviceTagDTO.getTag().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        assetRepository.modifyDeviceTag(deviceTagDTO.getDeviceId(), query);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/getAllDeviceTags")
    public ResponseEntity<List<String>> getAllDeviceTags() {
        log.info("GetAllDeviceTags endpoint called");
        return ResponseEntity.ok(assetRepository.getAllDeviceTags());
    }

    @GetMapping(value = "/getDevicesByTag")
    public ResponseEntity<List<String>> getDevicesByTag(@RequestParam String tag) {
        log.info("GetDevicesByTag endpoint called");
        return ResponseEntity.ok(assetRepository.getDevicesByTag(tag));
    }

    @PostMapping(value = "/addRelationships")
    public ResponseEntity<Void> addRelationships(@RequestParam String assetId, @RequestBody RelationshipsDTO relationshipsDTO) {
        //The map is: <targetId, relationshipLabel>
        log.info("AddRelationships endpoint called");
        for (Map.Entry<String, String> entry : relationshipsDTO.getRelationships().entrySet()) {
            if (dataManagerService.checkNewRelationship(assetId, entry.getKey())) {
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
    public ResponseEntity<Void> removeRelationships(@RequestBody RelNamesDTO relNamesDTO) {
        log.info("RemoveRelationships endpoint called");
        for (String relationship : relNamesDTO.getRelationships()) {
            assetRepository.removeRelationship(relationship);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/getNetwork")
    public ResponseEntity<String> getNetwork() {
        log.info("GetNetwork endpoint called");
        List<String> assets = assetRepository.getAssetsForNetwork();
        List<String> relationships = assetRepository.getRelationsForNetwork();
        String toReturn = "{\"nodes\":" + assets.toString() + ", \"links\":" + relationships.toString() + "}";
        return ResponseEntity.ok(toReturn);
    }

    @GetMapping(value = "/getFilteredNetwork")
    public ResponseEntity<String> getFilteredNetwork(@RequestParam String l1, @RequestParam String l2, @RequestParam String l3) {
        log.info("GetFilteredNetwork endpoint called");
        List<String> assets = assetRepository.getFilteredAssetsForNetwork(l1, l2, l3);
        List<String> relationships = assetRepository.getFilteredRelationsForNetwork(l1, l2, l3);
        String toReturn = "{\"nodes\":" + assets.toString() + ", \"links\":" + relationships.toString() + "}";
        return ResponseEntity.ok(toReturn);

    }

    @GetMapping(value = "/getNodesDataByLevels")
    public ResponseEntity<List<Map<String, Object>>> getNodesDataByLevels
            (@RequestParam String l1,
             @RequestParam(required = false) String l2,
             @RequestParam(required = false) String l3) {
        log.info("GetNodesDataByLevels endpoint called");
        String query = "MATCH (d) WHERE d.level1 =\""+ l1 + "\"";
        if(l2 != null){
            query += " AND d.level2 =\""+ l2 + "\"";
            if (l3 != null){
                query += " AND d.level3 =\""+ l3 + "\"";
            }
        }

        query += " WITH labels(d) AS label, count(d) AS count RETURN COLLECT({label: label[0], count: count}) as result";
        List<Map<String,List<Map<String, Object>>>> result = assetRepository.getNodesDataByLevels(query);

        if(result != null){
            List<Map<String, Object>> res = result.get(0).get("result");
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/deleteNodesByLevels")
    public ResponseEntity<Void> deleteNodesByLevels
            (@RequestParam String l1,
             @RequestParam(required = false) String l2,
             @RequestParam(required = false) String l3) {

        log.info("DeleteNodesByLevels endpoint called");
        String query = "MATCH (d) WHERE d.level1 =\""+ l1 + "\"";
        if(l2 != null){
            query += " AND d.level2 =\""+ l2 + "\"";
            if (l3 != null){
                query += " AND d.level3 =\""+ l3 + "\"";
            }
        }
        query += " DETACH DELETE d";
        assetRepository.deleteNodesByLevels(query);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/modifyLevels")
    public ResponseEntity<Void> modifyLevels(@RequestBody ModifyLevelsDTO modifyLevelsDTO) {
        log.info("ModifyLevels endpoint called");
        if(modifyLevelsDTO.getOldLevel1() == null || modifyLevelsDTO.getNewLevel() == null){
            return ResponseEntity.badRequest().build();
        }
        String query = "MATCH (d) WHERE d.level1 =\""+ modifyLevelsDTO.getOldLevel1() + "\"";
        if(modifyLevelsDTO.getOldLevel2() != null && !modifyLevelsDTO.getOldLevel2().isEmpty()){
            query += " AND d.level2 =\""+ modifyLevelsDTO.getOldLevel2() + "\"";
            if (modifyLevelsDTO.getOldLevel3() != null && !modifyLevelsDTO.getOldLevel3().isEmpty()){
                query += " AND d.level3 =\""+ modifyLevelsDTO.getOldLevel3() + "\"";
            }
        }

        switch (modifyLevelsDTO.getLevel()){
            case LEVEL1:
                query += " SET d.level1 =\""+ modifyLevelsDTO.getNewLevel() + "\"";
                break;
            case LEVEL2:
                if(modifyLevelsDTO.getOldLevel2() == null){
                    return ResponseEntity.badRequest().build();
                }
                query += " SET d.level2 =\""+ modifyLevelsDTO.getNewLevel() + "\"";
                break;
            case LEVEL3:
                if(modifyLevelsDTO.getOldLevel3() == null){
                    return ResponseEntity.badRequest().build();
                }
                query += " SET d.level3 =\""+ modifyLevelsDTO.getNewLevel() + "\"";
                break;
        }

        assetRepository.modifyLevels(query);
        return ResponseEntity.ok().build();


    }


    @PostMapping(value = "/addNewModel")
    public ResponseEntity<Void> addNewModel(@RequestBody ModelDTO modelDTO) {
        log.info("AddNewModel endpoint called");


        String path = assetRepository.retrieveModelPath(modelDTO.getAssetId());

        if (path == null) {
            path = dataManagerService.createModelFolder(folderPath + modelsPath, modelDTO.getAssetId());
            //TODO: CAPIRE SE SOSTITUIRE getAssetId con getAssetName (se gli asset hanno un nome univoco)
            assetRepository.addModelPath(modelDTO.getAssetId(), path);
        }
        //path is something like /data/models/assetId
        dataManagerService.saveModel(path, modelDTO.getModelName(), modelDTO.getModel(), modelDTO.getFromUser(), modelDTO.getAssetId());
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

    @PostMapping(value = "/addModelsByTag")
    public ResponseEntity<Void> addModelsByTag(@RequestBody ModelByTagDTO modelByTagDTO) {
        log.info("AddModelsByTag endpoint called");
        for (String deviceId : modelByTagDTO.getDeviceIds()) {
            String path = assetRepository.retrieveModelPath(deviceId);
            if (path == null) {
                path = dataManagerService.createModelFolder(folderPath + modelsPath, deviceId);
                assetRepository.addModelPath(deviceId, path);
            }
            dataManagerService.saveModel(path, modelByTagDTO.getModelName(), modelByTagDTO.getModel(), true, deviceId);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/modelInserted")
    public ResponseEntity<Void> modelInserted(@RequestParam String deviceId) {
        log.info("ModelInserted endpoint called");
        assetRepository.setPendingSend(deviceId, false);
        String model = assetRepository.getPendingModel(deviceId);
        dataManagerService.clearFolder(folderPath + modelsPath + "/" + deviceId + "/pendingModel");
        assetRepository.setPendingModel(deviceId, null);
        assetRepository.setCurrentModel(deviceId, model);

        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/saveDeviceData")
    public ResponseEntity<Void> saveDeviceData(@RequestBody DeviceDataDTO deviceDataDTO) {
        log.info("SaveDeviceData endpoint called");
        influxRepository.saveData(deviceDataDTO.getData());
        assetRepository.setPendingData(deviceDataDTO.getDeviceId(), false);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/setPendingRetrieve")
    public ResponseEntity<Void> setPendingRetrieve(@RequestParam String deviceId, @RequestParam boolean value) {
        log.info("SetPendingRetrieve endpoint called");
        assetRepository.setPendingRetrieve(deviceId, value);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/setPendingData")
    public ResponseEntity<Void> setPendingData(@RequestParam String deviceId, @RequestParam boolean value) {
        log.info("SetPendingData endpoint called");
        assetRepository.setPendingData(deviceId, value);
        return ResponseEntity.ok().build();
    }

    /**
     * This method is used to set multiple pending for many devices. It takes the DTO that contains the list of devices,
     * the type of pending to set and the boolean value.
     *
     * @return the list of devices that have been set to pending. Doesn't return the devices that are already in that state.
     */
    @PostMapping(value = "/setMultiplePending")
    public ResponseEntity<List<String>> setMultiplePending(@RequestBody MultiplePendingsDTO multiplePendingsDTO) {
        log.info("SetMultiplePending endpoint called");
        List<String> result = new ArrayList<>();
        for (String deviceId : multiplePendingsDTO.getDeviceIds()) {
            JSONObject json = new JSONObject(assetRepository.getDevicePendings(deviceId));
            boolean pending = json.getBoolean(multiplePendingsDTO.getPending().toString().toLowerCase());
            if (pending != multiplePendingsDTO.getValue()) {
                result.add(deviceId);
                try {
                    // Lambda function to capitalize the first letter
                    Function<String, String> capitalize = str -> str.isEmpty()
                            ? str
                            : str.substring(0, 1).toUpperCase() + str.substring(1);

                    // Construct the method name dynamically
                    String methodName = "setPending" + capitalize.apply(multiplePendingsDTO.getPending().toString().toLowerCase());

                    // Get the method from the assetRepository class with the right parameter types
                    Method method = assetRepository.getClass().getMethod(methodName, String.class, boolean.class);

                    // Invoke the method dynamically with the deviceId and the value
                    method.invoke(assetRepository, deviceId, multiplePendingsDTO.getValue());
                } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
                    // Handle exceptions (e.g., log the error)

                    e.printStackTrace();
                    return ResponseEntity.internalServerError().build();
                }
            }
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/getDeviceModelsHistory")
    public ResponseEntity<String> getDeviceModelsHistory(@RequestParam String deviceId) {
        log.info("GetDeviceModelsHistory endpoint called");
        return ResponseEntity.ok(dataManagerService.getModelsHistory(folderPath + modelsPath, deviceId));
    }


    @GetMapping(value = "/getDevicePendings")
    public ResponseEntity<PendingDeviceDTO> getDevicePendings(@RequestParam String deviceId) {
        log.info("GetDevicePendings endpoint called");
        JSONObject json = new JSONObject(assetRepository.getDevicePendings(deviceId));
        boolean data = json.getBoolean("data");
        boolean retrieve = json.getBoolean("retrieve");
        boolean send = json.getBoolean("send");
        return ResponseEntity.ok(new PendingDeviceDTO(data, retrieve, send));

    }

    @GetMapping(value = "/retrieveModel")
    public ResponseEntity<byte[]> retrieveModel(@RequestParam String deviceId, @RequestParam String modelName, @RequestParam boolean fromUser) {
        log.info("RetrieveModel endpoint called");
        try {
            byte[] model = dataManagerService.retrieveModel(folderPath + modelsPath + "/" + deviceId, modelName, fromUser);
            return ResponseEntity.ok(model);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }

    }


    @GetMapping(value = "/getLevel1")
    public ResponseEntity<List<String>> getLevel1() {
        log.info("RetrieveLevel1 endpoint called");
        return ResponseEntity.ok(assetRepository.retrieveLevel1());
    }

    @GetMapping(value = "/getLevel2")
    public ResponseEntity<List<String>> getLevel2(@RequestParam String level1) {
        log.info("RetrieveLevel2 endpoint called");
        return ResponseEntity.ok(assetRepository.retrieveLevel2(level1));
    }

    @GetMapping(value = "/getLevel3")
    public ResponseEntity<List<String>> getLevel3(@RequestParam String level1, @RequestParam String level2) {
        log.info("RetrieveLevel3 endpoint called");
        System.out.println(level1 + " " + level2);
        List<String> result = assetRepository.retrieveLevel3(level1, level2);
        System.out.println(result.toString());
        return ResponseEntity.ok(assetRepository.retrieveLevel3(level1, level2));
    }


    @GetMapping(value = "/getAllNodesId")
    @ResponseBody
    public ResponseEntity<List<String>> getAllNodesId() {
        log.info("GetAllNodesId endpoint called");
        return ResponseEntity.ok(assetRepository.getAllNodesId());
    }

    @GetMapping(value = "/retrieveDeviceDataMetadata")
    @ResponseBody
    public ResponseEntity<String> retrieveDeviceDataMetadata(@RequestParam String deviceId, @RequestParam String measurement) {
        log.info("RetrieveDeviceDataMetadata endpoint called");

        return ResponseEntity.ok(influxRepository.getMetadataForDevice(deviceId, measurement));
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

    @PostMapping(value = "/sendDeviceWarning")
    public ResponseEntity<Void> sendDeviceWarning(@RequestBody DeviceWarningDTO deviceWarningDTO) {
        log.info("SendDeviceWarning endpoint called");
        String caseTitle = "Segnalazione";

        JSONObject levels = new JSONObject(assetRepository.getLevels(deviceWarningDTO.getDeviceId()));

        if(deviceWarningDTO.getWarning() == null){
            return ResponseEntity.badRequest().build();
        }

        if(deviceWarningDTO.getWarning() == Warning.ANOMALY){
            AnomalyWarningCase anomalyWarningCase = new AnomalyWarningCase(caseTitle, deviceWarningDTO.getDeviceId(), LocalDateTime.now(), levels.getString("l1"),
                    levels.getString("l2"), levels.getString("l3"), deviceWarningDTO.getMessage());
            anomalyWarningCaseRepository.save(anomalyWarningCase);
            return ResponseEntity.ok().build();
        }

        if(deviceWarningDTO.getWarning() == Warning.RUL){
            RULWarningCase RULWarningCase = new RULWarningCase(caseTitle, deviceWarningDTO.getDeviceId(), LocalDateTime.now(), levels.getString("l1"),
                    levels.getString("l2"), levels.getString("l3"), deviceWarningDTO.getMessage());
            rluWarningCaseRepository.save(RULWarningCase);
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.badRequest().build();
    }

    /**
     * This method is used to get all the warning cases that have not been processed yet.
     *
     * @return a WarningCasesDTO object that contains all the warning cases that have not been processed yet.
     */
    @GetMapping(value = "/getCaseWarnings")
    public ResponseEntity<WarningCasesDTO> getCaseWarnings() {
        log.info("GetDeviceWarnings endpoint called");

        List<AnomalyWarningCase> anomalyWarningCases = anomalyWarningCaseRepository.findAllByProcessed(false);
        List<RULWarningCase> RULWarningCases = rluWarningCaseRepository.findAllByProcessed(false);

        List<AnomalyWarningDTO> anomalyWarningDTOS = new ArrayList<>();
        for(AnomalyWarningCase c : anomalyWarningCases){
            String deviceName = new JSONObject(assetRepository.getAsset(c.getDeviceId()))
                    .getJSONObject("asset")
                    .getJSONObject("properties")
                    .getString("name");
            anomalyWarningDTOS.add(new AnomalyWarningDTO(c.getId(), c.getCaseTitle(), c.getDeviceId(), deviceName, c.getCreation_date_time(),
                    c.getLevel1(), c.getLevel2(), c.getLevel3(), c.getAssignedTo(), c.getAnomaly_description()));
        }

        List<RULWarningDTO> RULWarningDTOS = new ArrayList<>();
        for(RULWarningCase c : RULWarningCases){
            String deviceName = new JSONObject(assetRepository.getAsset(c.getDeviceId()))
                    .getJSONObject("asset")
                    .getJSONObject("properties")
                    .getString("name");
            RULWarningDTOS.add(new RULWarningDTO(c.getId(), c.getCaseTitle(), c.getDeviceId(), deviceName, c.getCreation_date_time(),
                    c.getLevel1(), c.getLevel2(), c.getLevel3(), c.getAssignedTo(), c.getDevice_rlu()));
        }

        WarningCasesDTO warningCasesDTO = new WarningCasesDTO(anomalyWarningDTOS, RULWarningDTOS);
        return ResponseEntity.ok(warningCasesDTO);
    }

    @GetMapping(value = "/getProcessedCaseWarnings")
    public ResponseEntity<WarningCasesDTO> getProcessedCaseWarning(){
        log.info("GetProcessedCaseWarnings endpoint called");

        List<AnomalyWarningCase> anomalyWarningCases = anomalyWarningCaseRepository.findAllByProcessed(true);
        List<RULWarningCase> RULWarningCases = rluWarningCaseRepository.findAllByProcessed(true);

        List<ProcessedAnomalyWarningDTO> processedAnomalyWarningDTOS = new ArrayList<>();
        for(AnomalyWarningCase c : anomalyWarningCases){
            String deviceName = new JSONObject(assetRepository.getAsset(c.getDeviceId()))
                    .getJSONObject("asset")
                    .getJSONObject("properties")
                    .getString("name");
            processedAnomalyWarningDTOS.add(new ProcessedAnomalyWarningDTO(c.getId(), c.getCaseTitle(), c.getDeviceId(), deviceName,
                    c.getCreation_date_time(), c.getLevel1(), c.getLevel2(), c.getLevel3(), c.getAssignedTo(),
                    c.getAnomaly_description(), c.getProcessed_date_time(), c.getProcessed(), c.getNote(),
                    c.getIs_anomaly_correct(), c.getTechnician_anomaly()));
        }

        List<ProcessedRULWarningDTO> processedRULWarningDTOS = new ArrayList<>();
        for(RULWarningCase c : RULWarningCases){
            String deviceName = new JSONObject(assetRepository.getAsset(c.getDeviceId()))
                    .getJSONObject("asset")
                    .getJSONObject("properties")
                    .getString("name");
            processedRULWarningDTOS.add(new ProcessedRULWarningDTO(c.getId(), c.getCaseTitle(), c.getDeviceId(), deviceName,
                    c.getCreation_date_time(), c.getLevel1(), c.getLevel2(), c.getLevel3(), c.getAssignedTo(),
                    c.getDevice_rlu(), c.getProcessed_date_time(), c.getProcessed(), c.getNote(), c.getIs_rlu_correct(),
                    c.getTechnician_rlu()));
        }

        WarningCasesDTO warningCasesDTO = new WarningCasesDTO(processedAnomalyWarningDTOS, processedRULWarningDTOS);
        return ResponseEntity.ok(warningCasesDTO);
    }


    @PostMapping(value = "/assignWarningCase")
    public ResponseEntity<Void> assignWarningCase(@RequestBody AssignCaseDTO assignCaseDTO) {
        log.info("AssignWarningCase endpoint called");

        if(assignCaseDTO.getWarning() == Warning.ANOMALY){
            Optional<AnomalyWarningCase> anomalyWarningCase = anomalyWarningCaseRepository.findById(assignCaseDTO.getId());
            if(anomalyWarningCase.isEmpty()){
                return ResponseEntity.notFound().build();
            }
            anomalyWarningCase.get().setAssignedTo(assignCaseDTO.getTag());
            anomalyWarningCaseRepository.save(anomalyWarningCase.get());
            return ResponseEntity.ok().build();
        }

        if(assignCaseDTO.getWarning() == Warning.RUL){
            Optional<RULWarningCase> rluWarningCase = rluWarningCaseRepository.findById(assignCaseDTO.getId());
            if(rluWarningCase.isEmpty()){
                return ResponseEntity.notFound().build();
            }
            rluWarningCase.get().setAssignedTo(assignCaseDTO.getTag());
            rluWarningCaseRepository.save(rluWarningCase.get());
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.notFound().build();
    }


    @PostMapping(value = "/processWarningCase")
    public ResponseEntity<Void> processWarningCase(@RequestBody ProcessCaseDTO processCaseDTO){
        log.info("ProcessWarningCase endpoint called");

        if(processCaseDTO.getWarning() == Warning.ANOMALY){
            Optional<AnomalyWarningCase> anomalyWarningCase = anomalyWarningCaseRepository.findById(processCaseDTO.getId());

            if(anomalyWarningCase.isEmpty()){
                return ResponseEntity.notFound().build();
            }

            if(anomalyWarningCase.get().getAssignedTo() == null){
                return ResponseEntity.badRequest().build();
            }

            anomalyWarningCase.get().setIs_anomaly_correct(processCaseDTO.getIs_correct());
            if(!processCaseDTO.getIs_correct()){
                anomalyWarningCase.get().setTechnician_anomaly(processCaseDTO.getDescription());
            }
            anomalyWarningCase.get().setNote(processCaseDTO.getNote());
            anomalyWarningCase.get().setProcessed(true);
            anomalyWarningCase.get().setProcessed_date_time(LocalDateTime.now());
            anomalyWarningCaseRepository.save(anomalyWarningCase.get());
            return ResponseEntity.ok().build();
        }

        if(processCaseDTO.getWarning() == Warning.RUL){
            Optional<RULWarningCase> rluWarningCase = rluWarningCaseRepository.findById(processCaseDTO.getId());

            if(rluWarningCase.isEmpty()){
                return ResponseEntity.notFound().build();
            }

            if(rluWarningCase.get().getAssignedTo() == null){
                return ResponseEntity.badRequest().build();
            }

            rluWarningCase.get().setIs_rlu_correct(processCaseDTO.getIs_correct());
            if(!processCaseDTO.getIs_correct()){
                rluWarningCase.get().setTechnician_rlu(processCaseDTO.getDescription());
            }
            rluWarningCase.get().setNote(processCaseDTO.getNote());
            rluWarningCase.get().setProcessed(true);
            rluWarningCase.get().setProcessed_date_time(LocalDateTime.now());
            rluWarningCaseRepository.save(rluWarningCase.get());
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.notFound().build();
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
        for (User user : users) {
            result.add(new UserInfoDTO(user.getUsername(), user.getRole(), user.getId()));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/addUser")
    public ResponseEntity<Void> addUser(@RequestBody AddUserDTO addUserDTO) {
        log.info("AddUser endpoint called");
        User user = new User(addUserDTO.getUsername(), addUserDTO.getPassword(), Role.valueOf(addUserDTO.getRole()));
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/deleteUser")
    public ResponseEntity<Void> deleteUser(@RequestParam long id) {
        log.info("DeleteUser endpoint called");
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/updateUserRole")
    public ResponseEntity<Void> updateUserRole(@RequestParam long id, @RequestParam Role role) {
        log.info("UpdateUser endpoint called");
        Optional<User> user = userRepository.findById(id);
        //TODO: testare se funziona quando va supabase
        if (user.isPresent()) {
            user.get().setRole(role);
            userRepository.save(user.get());
            return ResponseEntity.ok().build();
        } else
            return ResponseEntity.notFound().build();
    }


    /**
     * TO DELETE, IT NEEDS ONLY FOR THE PYTHON SCRIPT //TODO
     */
    @PostMapping(value = "/PythonaddAsset")
    public ResponseEntity<String> pythonAddAsset(@RequestBody AddAssetDTO addAssetDTO) {
        log.info("PythonInsertAsset endpoint called");
        if (addAssetDTO.getLabel().equals("Device")) {
            return ResponseEntity.badRequest().build();
        }

        if (addAssetDTO.getName() == null || addAssetDTO.getName().isEmpty() ||
                addAssetDTO.getLabel() == null || addAssetDTO.getLabel().isEmpty() ||
                addAssetDTO.getLevel1() == null || addAssetDTO.getLevel1().isEmpty() ||
                addAssetDTO.getLevel2() == null || addAssetDTO.getLevel2().isEmpty() ||
                addAssetDTO.getLevel3() == null || addAssetDTO.getLevel3().isEmpty()) {

            return ResponseEntity.badRequest().body("One or more parameters are missing or empty");
        }

        String query = String.format("CREATE (d:%s {name:$name}) " +
                "SET d.isRegistered = true, d.level1 = $level1, d.level2 = $level2, d.level3 = $level3 " +
                "RETURN elementId(d)", addAssetDTO.getLabel());


        List<Map<String, Object>> result = assetRepository.pythonAddAsset(query, addAssetDTO.getName(), addAssetDTO.getLevel1(), addAssetDTO.getLevel2(), addAssetDTO.getLevel3());
        return ResponseEntity.ok(result.get(0).get("elementId(d)").toString());
    }

    /**
     * TO DELETE, IT NEEDS ONLY FOR THE PYTHON SCRIPT //TODO
     */
    @GetMapping(value = "/PythonRetrieveAll")
    public ResponseEntity<List<String>> pythonRetrieveAll() {
        log.info("PythonRetrieveAll endpoint called");
        return ResponseEntity.ok(assetRepository.retrieveAll());
    }
}
