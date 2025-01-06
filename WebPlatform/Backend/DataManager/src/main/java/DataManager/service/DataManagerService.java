package DataManager.service;

import DataManager.dto.gateway.ModifyLevelsDTO;
import DataManager.model.relDB.Filter;
import DataManager.repository.AssetRepository;
import DataManager.repository.FilterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.FileTime;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataManagerService {

    private final AssetRepository assetRepository;

    @Autowired
    private final FilterRepository filterRepository;


    public void createLevelsInAddingNode(String l1, String l2, String l3){
        /**
         * Controllo se esiste un filtro con name = l3, e parent1 = l1 e parent2 = l2
         *
         * Se non esiste, controllo se esiste un filtro con name = l2 e parent1 = l1 e parent2 = null
         * Se non esiste, controllo se esiste un filtro con name = l1 e parent1 = null e parent2 = null
         *
         */

        List<Filter> level3Filters = filterRepository.findLevel3Filters(l3, l1, l2);
        if(!level3Filters.isEmpty()) {
            //Esiste già un filtro del livello3
            return;
        }

        List<Filter> level2Filters = filterRepository.findLevel2Filters(l2, l1);
        if(!level2Filters.isEmpty()){
            //Esiste un filtro del livello2
            Filter level2 = level2Filters.get(0);
            Filter level1 = level2.getParentLevel1();

            //Creo il filtro per il livello3
            filterRepository.save(new Filter(l3, level1, level2));
        }else{
            //Non esiste un filtro del livello2
            List<Filter> level1Filters = filterRepository.findLevel1Filters(l1);
            if(!level1Filters.isEmpty()){
                //Esiste un filtro del livello1
                Filter level1 = level1Filters.get(0);

                //Creo il filtro per il livello2
                filterRepository.save(new Filter(l2, level1, null));
                Filter level2 = filterRepository.findLevel2Filters(l2, l1).get(0);

                //Creo il filtro per il livello3
                filterRepository.save(new Filter(l3, level1, level2));
            }else {
                //Non esiste un filtro del livello1

                //Creo il filtro per il livello1
                filterRepository.save(new Filter(l1, null, null));
                Filter level1 = filterRepository.findLevel1Filters(l1).get(0);

                //Creo il filtro per il livello2
                filterRepository.save(new Filter(l2, level1, null));
                Filter level2 = filterRepository.findLevel2Filters(l2, l1).get(0);

                //Creo il filtro per il livello3
                filterRepository.save(new Filter(l3, level1, level2));
            }
        }
    }


    public void deleteLevelsInDeleteNode(String l1, String l2, String l3){
        /**
         * Controllo se esiste un nodo con quei 3 livelli, se non esiste li elimino dal db
         */
        Boolean exists = assetRepository.existsByLevel1AndLevel2AndLevel3(l1, l2, l3);
        //Se esiste un nodo con quei 3 livelli, non posso eliminarli
        if(exists){
            return;
        }

        //Elimino il livello3
        List<Filter> level3Filters = filterRepository.findLevel3Filters(l3, l1, l2);
        if(!level3Filters.isEmpty()) {
            filterRepository.deleteAll(level3Filters);
        }

        //Controllo se eliminare il livello2
        List<String> levels3 = assetRepository.retrieveLevel3(l1, l2);
        if(levels3.isEmpty()){
            //Non esistono altri livelli 3 con quei livelli 1 e 2, devo eliminare il livello2
            List<Filter> level2Filters = filterRepository.findLevel2Filters(l2, l1);
            if(!level2Filters.isEmpty()){
                filterRepository.deleteAll(level2Filters);
            }

            //Controllo se eliminare il livello1
            List<String> levels2 = assetRepository.retrieveLevel2(l1);
            if(levels2.isEmpty()){
                //Non esistono altri livelli 2 con quel livello 1, devo eliminare il livello1
                List<Filter> level1Filters = filterRepository.findLevel1Filters(l1);
                if(!level1Filters.isEmpty()){
                    filterRepository.deleteAll(level1Filters);
                }
            }
        }


    }


    public void modifyLevelsInModifyNode(ModifyLevelsDTO modifyLevelsDTO){
        /**
         * Prendo il livello, prendo il filtro corrispondente
         * Se esiste un altro filtro che usa quello che voglio modifcare, ne creo uno nuovo con il nuovo nome
         */
        log.info("modifyLevelsDTO: " + modifyLevelsDTO.toString());
        switch (modifyLevelsDTO.getLevel()){
            case LEVEL1:
                /**
                 * Mi manda solo il livello1 -> modifico direttamente il livello1
                 * Mi manda l1 e l2 -> controllo se esiste un altro l2 che usa quel l1
                 *                  -> se si, creo un nuovo l1, faccio puntare a gli l2 il nuovo l1 e anche a gli l3 il nuovo l1
                 *                  -> se no, modifico direttamente il l1
                 * Mi manda l1, l2 e l3 -> controllo se esiste un altro l3 che usa quel l1e l2
                 *                  -> se si, creo un nuovo l1, un nuovo l2 che punta al nuovo l1 e faccio puntare gli l3 ai nuovi l1 e l2
                 *                  -> se no, controllo se esiste un altro l2 che usa lo stesso l1
                 *                      -> se si, creo un nuovo l1, faccio puntare a gli l2 il nuovo l1 e anche a gli l3 il nuovo l1
                 *                      -> se no, modifico direttamente il l1 sia per i l2 che per i l3
                 */
                if((modifyLevelsDTO.getOldLevel2() == null || modifyLevelsDTO.getOldLevel2().isEmpty()) && (modifyLevelsDTO.getOldLevel3() == null || modifyLevelsDTO.getOldLevel3().isEmpty())){
                    log.info("Solo l1 " + filterRepository.findLevel1Filters(modifyLevelsDTO.getOldLevel1()).toString());
                    //Modifico direttamente il livello1
                    filterRepository.findLevel1Filters(modifyLevelsDTO.getOldLevel1()).forEach(filter -> {
                        filter.setName(modifyLevelsDTO.getNewLevel());
                        filterRepository.save(filter);
                    });
                }else if((modifyLevelsDTO.getOldLevel2() != null && !modifyLevelsDTO.getOldLevel2().isEmpty()) && (modifyLevelsDTO.getOldLevel3() == null || modifyLevelsDTO.getOldLevel3().isEmpty())){
                    log.info("l1 e l2 " + filterRepository.findLevel2Filters(modifyLevelsDTO.getOldLevel2(), modifyLevelsDTO.getOldLevel1()).toString());
                    //Controllo se esiste un altro filtro che usa quel livello1
                    //Se si ne creo uno nuovo, altrimenti lo modifico
                    List<Filter> level2Filters = filterRepository.findLevel2Filters(modifyLevelsDTO.getOldLevel2(), modifyLevelsDTO.getOldLevel1());
                    Filter level2 = level2Filters.get(0);

                    boolean exists = filterRepository.existsOtherLevel2(level2.getParentLevel1().getName(), level2.getName());

                    if(exists) {
                        log.info("Esiste un altro l2 con quel l1 " + filterRepository.findLevel3ByLevel1AndLevel2(modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2()).toString());
                        //Se esiste un altro livello2 con quel livello1 devo creare un nuovo livello1
                        Filter l1 = new Filter(modifyLevelsDTO.getNewLevel(), null, null);
                        filterRepository.save(l1);
                        Filter newLevel1 = filterRepository.findLevel1Filters(modifyLevelsDTO.getNewLevel()).get(0);

                        List<Filter> level3Filters = filterRepository.findLevel3ByLevel1AndLevel2(modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2());
                        //A quel livello2 faccio puntare il nuovo livello1
                        level2Filters.forEach(filter -> {
                            filter.setParentLevel1(newLevel1);
                            filterRepository.save(filter);
                        });
                        //a tutti i livelli3 che puntanto a quel livello2 e a quel livello1 faccio puntare al nuovo livello1
                        level3Filters.forEach(filter -> {
                            filter.setParentLevel1(newLevel1);
                            filterRepository.save(filter);
                        });
                    }else{
                        log.info("Non esiste un altro l2 con quel l1 " +  filterRepository.findLevel1Filters(modifyLevelsDTO.getOldLevel1()).toString());
                        //Altrimenti modifico il livello1
                        filterRepository.findLevel1Filters(modifyLevelsDTO.getOldLevel1()).forEach(filter -> {
                            filter.setName(modifyLevelsDTO.getNewLevel());
                            filterRepository.save(filter);
                        });
                    }
                    }else {
                    log.info("l1, l2 e l3 " + filterRepository.findLevel3Filters(modifyLevelsDTO.getOldLevel3(), modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2()).toString());
                    //Controllo se esiste un altro filtro che usa quel livello1
                    //Se si ne creo uno nuovo, altrimenti lo modifico
                    List<Filter> level3Filters = filterRepository.findLevel3Filters(modifyLevelsDTO.getOldLevel3(), modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2());


                    boolean existsLevel3 = filterRepository.existsOtherLevel3(modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2(), modifyLevelsDTO.getOldLevel3());
                    //Se esiste un altro livello3 con quel livello1 e livello2 devo creare un nuovo livello2 e un nuovo livello1
                    if (existsLevel3) {
                        log.info("Esiste un altro l3 con quel l1 e l2 " + filterRepository.findLevel3Filters(modifyLevelsDTO.getOldLevel3(), modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2()).toString());
                        //Creo un nuovo livello1
                        Filter l1 = new Filter(modifyLevelsDTO.getNewLevel(), null, null);
                        filterRepository.save(l1);
                        Filter newLevel1 = filterRepository.findLevel1Filters(modifyLevelsDTO.getNewLevel()).get(0);
                        //Creo un nuovo livello2 che punta al nuovo livello1
                        Filter l2 = new Filter(modifyLevelsDTO.getOldLevel2(), newLevel1, null);
                        filterRepository.save(l2);
                        Filter newLevel2 = filterRepository.findLevel2Filters(modifyLevelsDTO.getOldLevel2(), modifyLevelsDTO.getNewLevel()).get(0);
                        //Ai livelli3 trovati faccio puntare il nuovo livello2 e livello1
                        level3Filters.forEach(filter -> {
                            filter.setParentLevel2(newLevel2);
                            filter.setParentLevel1(newLevel1);
                            filterRepository.save(filter);
                        });
                    } else {
                        log.info("Non esiste un altro l3 con quel l1 e l2 ");
                        boolean existsLevel2 = filterRepository.existsOtherLevel2(modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2());
                        //Se non esiste, controllo se esiste un altro livello2 con quel livello1
                        if (existsLevel2) {
                            log.info("Esiste un altro l2 con quel l1 " + filterRepository.findLevel3Filters(modifyLevelsDTO.getOldLevel3(), modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2()));
                            //Se si ne creo uno nuovo
                            //Creo un nuovo livello1
                            Filter l1 = new Filter(modifyLevelsDTO.getNewLevel(), null, null);
                            filterRepository.save(l1);
                            Filter newLevel1 = filterRepository.findLevel1Filters(modifyLevelsDTO.getNewLevel()).get(0);
                            //Modifico il livello2 e lo faccio puntare al nuovo livello1
                            level3Filters.forEach(filter -> {
                                filter.getParentLevel2().setParentLevel1(newLevel1);
                                filterRepository.save(filter);
                            });
                            //Modifico tutti i livelli3 che puntano a quel livello2 e a quel livello1 e li faccio puntare al nuovo livello1
                            level3Filters.forEach(filter -> {
                                filter.setParentLevel1(newLevel1);
                                filterRepository.save(filter);
                            });
                        } else {
                            log.info("Non esiste un altro l2 con quel l1 ");
                            //altrimenti modifico direttamente il livello1
                            level3Filters.forEach(filter -> {
                                filter.getParentLevel1().setName(modifyLevelsDTO.getNewLevel());
                                filter.getParentLevel2().getParentLevel1().setName(modifyLevelsDTO.getNewLevel());
                                filterRepository.save(filter);
                            });
                        }
                    }
                }
                break;
            case LEVEL2:
                /**
                 * Mi manda solo il livello2 -> modifico direttamente il livello2
                 * Mi manda l2 e l3 -> controllo se esiste un altro l3 che usa quel l2
                 *                      -> se si, creo un nuovo l2 che punta al vecchio l1, faccio puntare a gli l3 il nuovo l2
                 *                      -> se no, modifico direttamente il l2
                 */
                if(modifyLevelsDTO.getOldLevel3() == null || modifyLevelsDTO.getOldLevel3().isEmpty()) {
                    log.info("Solo l2 " + filterRepository.findLevel2Filters(modifyLevelsDTO.getOldLevel2(), modifyLevelsDTO.getOldLevel1()).toString());
                    //Non mi da il livello3
                    //Modifico direttamente il livello2
                    //I livelli3 che puntano a quel livello2 punteranno da soli al nuovo livello2

                    filterRepository.findLevel2Filters(modifyLevelsDTO.getOldLevel2(), modifyLevelsDTO.getOldLevel1()).forEach(filter -> {
                        filter.setName(modifyLevelsDTO.getNewLevel());
                        filterRepository.save(filter);
                    });
                }else {
                    log.info("l2 e l3 ");
                    //Mi da il livello3
                    //Controllo se esiste un altro livello3 che usa quel livello2
                    boolean exists = filterRepository.existsOtherLevel3(modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2(), modifyLevelsDTO.getOldLevel3());

                    if (exists) {
                        log.info("Esiste un altro l3 con quel l2 " + filterRepository.findLevel3Filters(modifyLevelsDTO.getOldLevel3(), modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2()));
                        //Se esiste, creo un nuovo livello2 che faccio puntare al vecchio livello1 e i livelli3 punteranno al nuovo livello2
                        List<Filter> level3Filters = filterRepository.findLevel3Filters(modifyLevelsDTO.getOldLevel3(), modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2());
                        Filter l2 = new Filter(modifyLevelsDTO.getNewLevel(), level3Filters.get(0).getParentLevel1(), null);
                        filterRepository.save(l2);
                        Filter newLevel2 = filterRepository.findLevel2Filters(modifyLevelsDTO.getNewLevel(), modifyLevelsDTO.getOldLevel1()).get(0);
                        level3Filters.forEach(filter -> {
                            filter.setParentLevel2(newLevel2);
                            filterRepository.save(filter);
                        });
                    } else {
                        log.info("Non esiste un altro l3 con quel l2 ");
                        //Se non esiste, modifico direttamente il livello2
                        filterRepository.findLevel2Filters(modifyLevelsDTO.getOldLevel2(), modifyLevelsDTO.getOldLevel1()).forEach(filter -> {
                            filter.setName(modifyLevelsDTO.getNewLevel());
                            filterRepository.save(filter);
                        });
                    }
                }
                break;
            case LEVEL3:
                /**
                 * Modifico direttamente il livello3
                 */
                filterRepository.findLevel3Filters(modifyLevelsDTO.getOldLevel3(), modifyLevelsDTO.getOldLevel1(), modifyLevelsDTO.getOldLevel2()).forEach(filter -> {
                    filter.setName(modifyLevelsDTO.getNewLevel());
                    filterRepository.save(filter);
                });
                break;
        }
    }

    @Transactional(transactionManager = "transactionManager")
    public void deleteLevels(String l1, String l2, String l3){

        if (l2 == null && l3 == null) {
            //Devo eliminare i livello1 con quel l1 e tutti i livelli2 e livelli3 con quel l1
            filterRepository.deleteAllByLevel1(l1);
            filterRepository.deleteLevel1ByName(l1);
        }else if(l3 == null) {
            //Devo eliminare i livelli2 con quel l1 e l2  e tutti i livelli3 con quel l1 e l2
            filterRepository.deleteAllByParentLevel1NameAndParentLevel2Name(l1, l2);
            filterRepository.deleteAllLevel2ByLevel1(l1, l2);
        }else{
            //Devo eliminare i livelli3 con quel l1 e l2 e l3
            filterRepository.deleteAllLevel3ByLevel1AndLevel2(l1, l2, l3);
        }
    }

    public Boolean checkNewRelationship(String assetId, String targetId){
        JSONObject assetJson = new JSONObject(assetRepository.getLevels(assetId));
        JSONObject targetJson = new JSONObject(assetRepository.getLevels(targetId));
        if(!assetJson.getBoolean("isReg")){
            return true;
        }

        return assetJson.getString("l1").equals(targetJson.getString("l1")) &&
                assetJson.getString("l2").equals(targetJson.getString("l2")) &&
                assetJson.getString("l3").equals(targetJson.getString("l3"));

    }

    public void createFolder(String folderPath, String folderName){
        File directory = new File(folderPath);
        if (!directory.exists()) {
            return; //TODO: IT MUST RAISE AN EXCEPTION
        }

        File folder = new File(directory, folderName);
        if(!folder.exists()) {
            folder.mkdirs(); //create the folder
        }
    }

    public String createModelFolder(String folderPath, String folderName){
        File directory = new File(folderPath);
        if (!directory.exists()) {
            directory.mkdirs(); //create the folder
        }
        log.info("qui");
        File folder = new File(directory, folderName);
        log.info(folder.getPath());
        if(!folder.exists()) {
            folder.mkdirs(); //create the folder
        }
        createFolder(folder.getPath(), "currentModel");
        createFolder(folder.getPath(), "pendingModel");
        createFolder(folder.getPath(), "modelsHistory");

        String modelsHistoryPath = folder.getPath() + "/modelsHistory";
        createFolder(modelsHistoryPath, "fromAsset");
        createFolder(modelsHistoryPath, "fromUser");
        return folderPath + "/" + folderName;
    }


    public void saveModel(String modelPath, String modelName, byte[] model, Boolean fromUser, String deviceId){
        // modelPath is something like /data/models/assetId
        File folder = new File(modelPath);
        if(!folder.exists()){
            return; //TODO: IT MUST RAISE AN EXCEPTION
        }

        if(!modelName.toLowerCase().endsWith(".pkl")){
            modelName += ".pkl";
        }

        if(fromUser) {
            String history = modelPath + "/modelsHistory/fromUser";

            modelName = checkName(history, modelName);


            //clear /pending
            String pending = modelPath + "/pendingModel";
            clearFolder(pending);
            String filePath = pending + "/" + modelName;

            //put new in pending
            try (FileOutputStream fileOut = new FileOutputStream(filePath);
                 DataOutputStream objectOut = new DataOutputStream(fileOut)) {
                objectOut.write(model);
                System.out.println("Pickle file saved successfully.");
            } catch (IOException e) {
                e.printStackTrace();
            }

            //set request of send pending true in neo4j
            assetRepository.setPendingSend(deviceId, true);
            assetRepository.setPendingModel(deviceId, modelName);

            //put new in history from user

            filePath = history + "/" + modelName;

            try (FileOutputStream fileOut = new FileOutputStream(filePath);
                 DataOutputStream objectOut = new DataOutputStream(fileOut)) {
                objectOut.write(model);
                System.out.println("Pickle file saved successfully.");
            } catch (IOException e) {
                e.printStackTrace();
            }


        }else {
            String history = modelPath + "/modelsHistory/fromAsset";

            modelName = checkName(history, modelName);

            //clear current
            String current = modelPath + "/currentModel";
            clearFolder(current);

            String filePath = current + "/" + modelName;
            //put new in current
            try (FileOutputStream fileOut = new FileOutputStream(filePath);
                 DataOutputStream objectOut = new DataOutputStream(fileOut)) {
                objectOut.write(model);
                System.out.println("Pickle file saved successfully.");
            } catch (IOException e) {
                e.printStackTrace();
            }

            //put new in history from asset

            filePath = history + "/" + modelName;

            try (FileOutputStream fileOut = new FileOutputStream(filePath);
                 DataOutputStream objectOut = new DataOutputStream(fileOut)) {
                objectOut.write(model);
                System.out.println("Pickle file saved successfully.");
            } catch (IOException e) {
                e.printStackTrace();
            }

            //set request of retrieve pending false in neo4j
            assetRepository.setPendingRetrieve(deviceId, false);
            assetRepository.setCurrentModel(deviceId, modelName);

        }

    }

    public byte[] retrieveModel(String deviceId, String modelName, Boolean fromUser){
        String folderPath = assetRepository.retrieveModelPath(deviceId);
        folderPath += "/modelsHistory";
        if(fromUser) {
            folderPath += "/fromUser";
        }
        else{
            folderPath += "/fromAsset";
        }
        if(modelName.endsWith(".pkl")){
            modelName = modelName + ".pkl";
        }


        File directory = new File(folderPath);
        if (!directory.exists()) {
            throw new RuntimeException("folder not found"); //TODO: MANAGE EXCEPTION DIFFERENT
        }

        File[] files = directory.listFiles();
        if(files != null) {
            for (File file : files) {
                if (file.getName().equals(modelName)) {
                    try (FileInputStream fileIn = new FileInputStream(file);
                         DataInputStream objectIn = new DataInputStream(fileIn)) {
                        byte[] model = objectIn.readAllBytes();
                        System.out.println("Pickle file retrieved successfully.");
                        return model;
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        throw new RuntimeException("file not found"); //TODO: MANAGE EXCEPTION DIFFERENT
    }


    public void clearFolder(String folderPath){
        File directory = new File(folderPath);
        if (!directory.exists()) {
            return; //TODO: IT MUST RAISE AN EXCEPTION
        }

        File[] files = directory.listFiles();
        if(files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    clearFolder(file.getPath());
                }
                file.delete();
            }
        }
    }


    public String checkName(String directory, String name){
        if(isFileInDirectory(directory, name)){
            String n = name.substring(0, name.length() - 4) + "_1.pkl";
            return checkName(directory, n);
        }
        return name;
    }

    public boolean isFileInDirectory(String directoryPath, String fileNameToCheck) {
        File directory = new File(directoryPath);

        // Check if the directory exists and is indeed a directory
        if (directory.exists() && directory.isDirectory()) {
            File[] files = directory.listFiles();

            if (files != null) {
                for (File file : files) {
                    if (file.getName().equals(fileNameToCheck)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public String getModelsHistory(String folderPath, String deviceId){
        String userHistory = folderPath + "/" + deviceId + "/modelsHistory/fromUser";
        String assetHistory = folderPath + "/" + deviceId + "/modelsHistory/fromAsset";

        List<String> userFiles = getHistory(userHistory);
        List<String> assetFiles = getHistory(assetHistory);

        return String.format("{\"userHistory\": %s, \"assetHistory\": %s}",
                userFiles.toString(),
                assetFiles.toString());



    }

    public List<String> getHistory(String directoryPath){
        Path dir = Paths.get(directoryPath);
        List<String> fileList = new ArrayList<>();
        try {


            List<Path> files;

            try (Stream<Path> stream = Files.list(dir)) {
                files = stream
                        .filter(Files::isRegularFile)
                        .toList();
            } catch (IOException e) {
                return fileList;
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (Path file : files) {
                BasicFileAttributes attrs = Files.readAttributes(file, BasicFileAttributes.class);
                FileTime creationTime = attrs.creationTime();
                LocalDateTime creationDateTime = LocalDateTime.ofInstant(creationTime.toInstant(), ZoneId.systemDefault());
                String formattedCreationTime = creationDateTime.format(formatter);
                String jsonString = String.format("{\"modelname\": \"%s\", \"creationDate\": \"%s\"}",
                        file.getFileName().toString(),
                        formattedCreationTime);
                fileList.add(jsonString);
            }

            fileList.sort(Comparator.comparing((String json) -> {
                String creationDate = json.substring(json.indexOf("\"creationDate\": \"") + 17, json.length() - 2);
                return LocalDateTime.parse(creationDate, formatter);
            }).reversed());

        } catch (IOException e) {
            e.printStackTrace();
        }
        return fileList;
    }


}
