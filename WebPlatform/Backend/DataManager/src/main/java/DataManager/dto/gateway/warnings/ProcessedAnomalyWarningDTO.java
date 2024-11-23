package DataManager.dto.gateway.warnings;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class ProcessedAnomalyWarningDTO extends AnomalyWarningDTO{

    private LocalDateTime processed_date_time;

    private Boolean processed;

    private String note;

    private Boolean is_warning_correct;

    private String technician_description;

    public ProcessedAnomalyWarningDTO(Long id, String caseTitle, String deviceId, String deviceName, LocalDateTime creationDateTime, String level1, String level2, String level3, String assignedTo, String anomaly_description) {
        super(id, caseTitle, deviceId, deviceName, creationDateTime, level1, level2, level3, assignedTo, anomaly_description);
    }

    public ProcessedAnomalyWarningDTO(Long id, String caseTitle, String deviceId, String deviceName,
                                      LocalDateTime creationDateTime, String level1, String level2, String level3,
                                      String assignedTo, String anomaly_description, LocalDateTime processed_date_time,
                                      Boolean processed, String note, Boolean is_anomaly_correct,
                                      String technician_anomaly) {
        super(id, caseTitle, deviceId, deviceName, creationDateTime, level1, level2, level3, assignedTo, anomaly_description);
        this.processed_date_time = processed_date_time;
        this.processed = processed;
        this.note = note;
        this.is_warning_correct = is_anomaly_correct;
        this.technician_description = technician_anomaly;
    }
}
