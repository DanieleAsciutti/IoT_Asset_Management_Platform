package DataManager.service;

import DataManager.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

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


    public Boolean checkNewRelationship(String assetId, String targetId){
        JSONObject assetJson = new JSONObject(assetRepository.getLevels(assetId));
        JSONObject targetJson = new JSONObject(assetRepository.getLevels(targetId));

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
