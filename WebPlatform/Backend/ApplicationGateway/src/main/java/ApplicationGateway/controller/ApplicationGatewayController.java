package ApplicationGateway.controller;

import ApplicationGateway.dto.AsyncControllerDTO.DeviceDataDTO;
import ApplicationGateway.dto.AsyncControllerDTO.WarningDTO;
import ApplicationGateway.dto.SecurityResponse;
import ApplicationGateway.dto.assetManDTO.*;
import ApplicationGateway.dto.auth_AuthDTO.*;
import ApplicationGateway.dto.dataManagerDTO.AddAssetDTO;
import ApplicationGateway.dto.dataManagerDTO.DeviceTagDTO;
import ApplicationGateway.dto.dataManagerDTO.warnings.ProcessedWarnCasesDTO;
import ApplicationGateway.dto.dataManagerDTO.warnings.WarnCasesDTO;
import ApplicationGateway.dto.enums.Warning;
import ApplicationGateway.dto.frontend.*;
import ApplicationGateway.service.ApplicationGatewayService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3050"}, allowCredentials = "true")
public class ApplicationGatewayController {

    private final ApplicationGatewayService applicationGatewayService;

    // AUTHENTICATION AND AUTHORIZATION

    @PostMapping(value= "/authenticate",consumes = "application/json", produces ="application/json")
    public ResponseEntity<SecurityResponse> authenticate(
            @RequestBody AuthenticationRequest authenticationRequest,
            HttpServletResponse response
    ) {
        System.out.println(authenticationRequest.getUsername() + " " + authenticationRequest.getPasswordHash());
        log.info("Authenticating the user");
        ResponseEntity<AuthenticationResponse> authenticationResponseEntity = applicationGatewayService.authenticate(authenticationRequest);
        AuthenticationResponse authenticationResponse = authenticationResponseEntity.getBody();

        if(authenticationResponse.getIsAuthenticated()){
            SecurityResponse securityResponse = SecurityResponse.builder()
                    .role(authenticationResponse.getRole())
                    .username(authenticationRequest.getUsername())
                    .build();

            Cookie cookie = new Cookie("token", authenticationResponse.getAccessToken());
            cookie.setHttpOnly(true);
            cookie.setAttribute("SameSite", "Strict"); //prevent CSRF
            cookie.setSecure(true);
            response.addCookie(cookie);


            return ResponseEntity.status(HttpStatus.OK).body(securityResponse);
        }
        return ResponseEntity.status(401).build();
    }

    /*
    @GetMapping(value= "/authorize", produces ="application/json")
    public ResponseEntity<AuthorizationResponse> authorize(
            @RequestParam String accessToken
    ){
        log.info("Authorizing the user...");
        return applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
    }

     */

    // ASSET MANAGEMENT


    //This endpoint is called only by the asyncController
    @PostMapping(value = "/addDevice")
    public ResponseEntity<String> addDevice(@RequestParam String name){
        log.info("AddDevice endpoint called");
        //TODO: understand if we have to check who calls this endpoint
        log.info("User authorized");
        return applicationGatewayService.addDevice(name);
    }

    @GetMapping(value = "/getAsset")
    public ResponseEntity<String> getAsset(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String id
    ){
        log.info("GetAsset endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.getAsset(id);
    }

    @PostMapping(value = "/addAsset")
    public ResponseEntity<Void> addAsset(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestBody AddAssetDTO addAssetDTO){
        log.info("InsertAsset endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.addAsset(addAssetDTO);
    }

    @PostMapping(value = "/deleteAsset")
    public ResponseEntity<Void> deleteAsset(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String assetId){
        log.info("DeleteAsset endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.deleteAsset(assetId);
    }

    @PostMapping(value = "/deleteRelationship")
    public ResponseEntity<Void> deleteRelationship(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String relId){
        log.info("DeleteRelationship endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.deleteRelationship(relId);

    }


    @PostMapping(value = "/addAttributes")
    public ResponseEntity<Void> addAttributes(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String assetId,
            @RequestBody AttributesDTO attributes){
        log.info("AddAttributes endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.addAttributes(assetId,attributes);
    }

    @PostMapping(value = "/removeAttributes")
    public ResponseEntity<Void> removeAttributes(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String assetId,
            @RequestBody NamesDTO attributes){
        log.info("RemoveAttributes endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.removeAttributes(assetId,attributes);
    }

    @PostMapping(value = "/modifyDeviceTag")
    public ResponseEntity<Void> modifyDeviceTag(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestBody DeviceTagDTO deviceTagDTO
            ){
        log.info("ModifyDeviceTag endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.modifyDeviceTag(deviceTagDTO);

    }

    @GetMapping(value = "/getAllDeviceTags")
    public ResponseEntity<List<String>> getAllDeviceTags(
            @CookieValue (value = "token", defaultValue = "") String accessToken
    ){
        log.info("getAllDeviceTags endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(applicationGatewayService.getAllDeviceTags());
    }

    @GetMapping(value = "/getDevicesByTag")
    public ResponseEntity<List<String>> getDevicesByTag(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String tag
    ){
        log.info("getDevicesByTag endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(applicationGatewayService.getDevicesByTag(tag));
    }

    @GetMapping(value = "/getAllUnregisteredDevices")
    public ResponseEntity<List<UnregisteredDeviceDTO>> getAllUnregisteredDevices(@CookieValue (value = "token", defaultValue = "") String accessToken){
        log.info("GetAllUnregisteredDevices endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return ResponseEntity.ok(applicationGatewayService.getAllUnregisteredDevices());
    }

    @GetMapping(value = "/getAllRegisteredDevices")
    public ResponseEntity<List<String>> getAllRegisteredDevices(@CookieValue (value = "token", defaultValue = "") String accessToken){
        log.info("GetAllRegisteredDevices endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return ResponseEntity.ok(applicationGatewayService.getAllRegisteredDevices());
    }

    @GetMapping(value = "/getFilteredRegisteredDevices")
    public ResponseEntity<List<String>> getFilteredRegisteredDevices(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String l1, @RequestParam String l2, @RequestParam String l3){
        log.info("GetFilteredRegisteredDevices endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return ResponseEntity.ok(applicationGatewayService.getFilteredRegisteredDevices(l1,l2,l3));
    }

    @PostMapping(value = "/registerDevice")
    public ResponseEntity<Void> registerDevice(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String id,
            @RequestBody AddDeviceDTO addDeviceDTO){
        log.info("RegisterDevice endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.registerDevice(id, addDeviceDTO);
    }

    @PostMapping(value = "/addRelationships")
    public ResponseEntity<Void> addRelationships(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String assetId,
            @RequestBody RelationshipsDTO relationships){
        log.info("addRelationships endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.addRelationships(assetId,relationships);
    }

    @PostMapping(value = "/removeRelationships")
    public ResponseEntity<Void> removeRelationships(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestBody RelationshipsDTO relationships){
        log.info("removeRelationships endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.removeRelationships(relationships);
    }

    @GetMapping(value = "/getNetwork")
    public ResponseEntity<String> getNetwork(
            @CookieValue (value = "token", defaultValue = "") String accessToken){
        log.info("GetNetwork endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.getNetwork();
    }

    @GetMapping(value = "/getFilteredNetwork")
    public ResponseEntity<String> getFilteredNetwork(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String l1, @RequestParam String l2, @RequestParam String l3){
        log.info("GetFilteredNetwork endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.getFilteredNetwork(l1,l2,l3);
    }

    @GetMapping(value ="/getNodesDataByLevels")
    public ResponseEntity<List<Map<String, Object>>> getNodesDataByLevels(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String l1, @RequestParam(required = false) String l2, @RequestParam(required = false) String l3){

        log.info("GetNodesDataByLevels endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return ResponseEntity.ok(applicationGatewayService.getNodesDataByLevels(l1,l2,l3));
    }

    @PostMapping(value = "/deleteNodesByLevels")
    public ResponseEntity<Void> deleteNodesByLevels(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String l1, @RequestParam(required = false) String l2, @RequestParam(required = false) String l3) {

        log.info("DeleteNodesByLevels endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.deleteNodesByLevels(l1,l2,l3);
    }

    @PostMapping(value = "/modifyLevels")
    public ResponseEntity<Void> modifyLevels(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestBody ModifyLevelsDTO modifyLevelsDTO) {
        log.info("ModifyLevels endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.modifyLevels(modifyLevelsDTO);
    }

    /**
     * This endpoint is called by the user to save a new model for a specific device
     * @param modelDTO containts the deviceId, the model itself and a boolean to specify if the model is from the user or not
     */
    @PostMapping(value = "/addNewModel")
    public ResponseEntity<Void> addNewModel(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestBody ModelDTO modelDTO){
        log.info("AddNewModel endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.addNewModel(modelDTO);
    }

    @PostMapping(value = "/addModelsByTag")
    public ResponseEntity<Void> addModelsByTag(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestBody ModelByTagDTO modelByTagDTO){

        log.info("AddModelsByTag endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.addModelsByTag(modelByTagDTO);
    }

    /**
     * This endpoint is called by the user to request to retrieve the updated model for a specific device
     * @param accessToken the token of the user
     * @param deviceId the id of the device
     */
    @PostMapping(value = "/updateModel")
    public ResponseEntity<Void> updateModel(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String deviceId){
        log.info("UpdateModel endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.updateModel(deviceId);
    }

    @PostMapping(value = "/updateModelsByTag")
    public ResponseEntity<Void> updateModelsByTag(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestBody DeviceIdsDTO deviceIdsDTO){

        log.info("UpdateModelsByTag endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.updateModelsByTag(deviceIdsDTO);
    }


    /**
     * This endpoint is called by the asyncController to save a new model for a specific device
     */
    @PostMapping(value = "/sendModel")
    public ResponseEntity<Void> sendModel(@RequestBody ModelDTO modelDTO){
        log.info("SendModel endpoint called");
        return applicationGatewayService.sendModel(modelDTO);
    }

    /**
     * This endpoint is called by the asyncController to notify that the model has been inserted for a specific device
     */
    @PostMapping(value = "/modelInserted")
    public ResponseEntity<Void> modelInserted(@RequestParam String deviceId){
        log.info("ModelInserted endpoint called");
        return applicationGatewayService.modelInserted(deviceId);
    }

    /**
     * This endpoint is called by the user to request to retrieve the updated data for a specific device
     */
    @PostMapping(value = "/updateData")
    public ResponseEntity<Void> updateData(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String deviceId){
        log.info("updateData endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.updateData(deviceId);
    }

    /**
     * This endpoint is called by the user to request to retrieve the updated data for multiple devices
     */
    @PostMapping(value = "/updateDataByTag")
    public ResponseEntity<Void> updateDataByTag(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestBody DeviceIdsDTO deviceIdsDTO){

        log.info("updateDataByTag endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.updateDataByTag(deviceIdsDTO);
    }


    /**
     * This endpoint is called by the asyncController to save the data for a specific device
     */
    @PostMapping(value = "/sendData")
    public ResponseEntity<Void> sendData(@RequestBody DeviceDataDTO deviceDataDTO){
        log.info("SendData endpoint called");
        return applicationGatewayService.saveDeviceData(deviceDataDTO);
    }

    @GetMapping(value = "/getDeviceModelsHistory")
    public ResponseEntity<String> getDeviceModelsHistory(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String deviceId) {
        log.info("getDeviceModelsHistory endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.getDeviceModelsHistory(deviceId);
    }

    @GetMapping(value = "/retrieveModel")
    public ResponseEntity<byte[]> retrieveModel(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String deviceId,
            @RequestParam String modelName,
            @RequestParam Boolean fromUser){
        log.info("RetrieveModel endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.retrieveModel(deviceId,modelName,fromUser);
    }

    @GetMapping(value = "/retrieveDeviceDataMetadata")
    public ResponseEntity<String> retrieveDeviceDataMetadata(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String deviceId, @RequestParam String measurement)
    {
        log.info("RetrieveDeviceDataMetadata endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.retrieveDeviceDataMetadata(deviceId,measurement);
    }

    @GetMapping(value = "/retrieveDeviceDataMeasurements")
    public ResponseEntity<String> retrieveDeviceDataMeasurements(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestParam String deviceId) {
        log.info("RetrieveDeviceDataMeasurements endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.retrieveDeviceDataMeasurements(deviceId);
    }

    @GetMapping(value = "/downloadDeviceData", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<InputStreamResource> downloadDeviceData(
            @CookieValue(value = "token", defaultValue = "") String accessToken,
            @RequestParam String deviceId) {
        log.info("DownloadDeviceData endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.downloadDeviceData(deviceId);
    }


    @GetMapping(value = "/getLevel1")
    public ResponseEntity<List<String>> getLevel1(
            @CookieValue(value = "token", defaultValue = "") String accessToken){
        log.info("GetLevel1 endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(applicationGatewayService.getLevel1());

    }

    @GetMapping(value = "/getLevel2")
    public ResponseEntity<List<String>> getLevel2(
            @CookieValue(value = "token", defaultValue = "") String accessToken,
            @RequestParam String level1){
        log.info("GetLevel2 endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(applicationGatewayService.getLevel2(level1));
    }

    @GetMapping(value = "/getLevel3")
    public ResponseEntity<List<String>> getLevel3(
            @CookieValue(value = "token", defaultValue = "") String accessToken,
            @RequestParam String level1, @RequestParam String level2){
        log.info("GetLevel3 endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(applicationGatewayService.getLevel3(level1, level2));
    }


    /**
     * This endpoint is called by the asyncController to send the case warning created by a device
     */
    @PostMapping(value = "/sendDeviceWarning")
    public ResponseEntity<Void> sendDeviceWarning(@RequestBody WarningDTO warningDTO){
        log.info("SendDeviceWarning endpoint called");
        return applicationGatewayService.sendDeviceWarning(warningDTO);
    }

    @GetMapping(value = "/getCaseWarnings")
    public ResponseEntity<WarnCasesDTO> getDeviceWarnings(
            @CookieValue(value = "token", defaultValue = "") String accessToken){
        log.info("GetDeviceWarnings endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(applicationGatewayService.getCaseWarnings());
    }

    @GetMapping(value = "/getProcessedCaseWarnings")
    public ResponseEntity<ProcessedWarnCasesDTO> getProcessedWarnings(
            @CookieValue(value = "token", defaultValue = "") String accessToken){
        log.info("GetProcessedWarnings endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(applicationGatewayService.getProcessedCaseWarnings());
    }

    @PostMapping(value = "/assignWarningCase")
    public ResponseEntity<Void> assignWarningCase(
            @CookieValue(value = "token", defaultValue = "") String accessToken,
            @RequestBody AssignCaseDTO assignCaseDTO){
        log.info("AssignWarningCase endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.assignWarningCase(assignCaseDTO);
    }

    @PostMapping(value = "/processWarningCase")
    public ResponseEntity<Void> processWarningCase(
            @CookieValue(value = "token", defaultValue = "") String accessToken,
            @RequestBody ProcessCaseDTO processCaseDTO){
        log.info("ProcessWarningCase endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }

        return applicationGatewayService.processWarningCase(processCaseDTO);
    }

    @PostMapping(value = "/deleteWarningCase")
    public ResponseEntity<Void> deleteWarningCase(
            @CookieValue(value = "token", defaultValue = "") String accessToken,
            @RequestParam long caseId, @RequestParam Warning warning){
        log.info("DeleteWarningCase endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if (!authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }

        return applicationGatewayService.deleteWarningCase(caseId, warning);
    }



    //------------ USER MANAGEMENT ------------//
    @GetMapping(value="/users")
    @ResponseBody
    public ResponseEntity<CompactUserDTO> getUsers(
            @CookieValue (value = "token", defaultValue = "") String accessToken
    ){
        log.info("GetUsers endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        log.info("User authorized");
        return applicationGatewayService.getUsers();
    }

    @PostMapping(value = "/addUser")
    public ResponseEntity<Void> addUser(
            @CookieValue (value = "token", defaultValue = "") String accessToken,
            @RequestBody UserDTO userDTO){
        log.info("AddUser endpoint called");
//        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize( new AuthorizationRequest(accessToken) );
//        if( !authorization.getBody().getIsAuthorized()) {
//            log.info("User unauthorized");
//            return ResponseEntity.status(401).build();
//        }
        return applicationGatewayService.addUser(userDTO);

    }

    @PostMapping(value = "/deleteUser")
    public ResponseEntity<Void> deleteUser(
            @CookieValue (value = "token" ,defaultValue = "") String accessToken,
            @RequestParam long id){
        log.info("DeleteUser endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.deleteUser(id);
    }

    @PostMapping(value = "/updateUserRole")
    public ResponseEntity<Void> updateUserRole(
            @CookieValue (value = "token" ,defaultValue = "") String accessToken,
            @RequestParam long id, @RequestParam String role){
        log.info("UpdateUserRole endpoint called");
        ResponseEntity<AuthorizationResponse> authorization = applicationGatewayService.authorize(new AuthorizationRequest(accessToken));
        if( !authorization.getBody().getIsAuthorized()) {
            log.info("User unauthorized");
            return ResponseEntity.status(401).build();
        }
        return applicationGatewayService.updateUserRole(id, Role.valueOf(role));
    }

}
