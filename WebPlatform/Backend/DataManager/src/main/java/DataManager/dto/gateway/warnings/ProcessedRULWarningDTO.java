package DataManager.dto.gateway.warnings;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class ProcessedRULWarningDTO extends RULWarningDTO{

    private LocalDateTime processed_date_time;

    private Boolean processed;

    private String note;

    private Boolean is_rlu_correct;

    private String technician_rlu;

    public ProcessedRULWarningDTO(Long id, String caseTitle, String deviceId, String deviceName, LocalDateTime creationDateTime, String level1, String level2, String level3, String assignedTo, String device_rlu) {
        super(id, caseTitle, deviceId, deviceName, creationDateTime, level1, level2, level3, assignedTo, device_rlu);
    }

    public ProcessedRULWarningDTO(Long id, String caseTitle, String deviceId, String deviceName,
                                  LocalDateTime creationDateTime, String level1, String level2, String level3,
                                  String assignedTo, String device_rlu, LocalDateTime processed_date_time,
                                  Boolean processed, String note, Boolean is_rlu_correct,
                                  String technician_rlu) {
        super(id, caseTitle, deviceId, deviceName, creationDateTime, level1, level2, level3, assignedTo, device_rlu);
        this.processed_date_time = processed_date_time;
        this.processed = processed;
        this.note = note;
        this.is_rlu_correct = is_rlu_correct;
        this.technician_rlu = technician_rlu;
    }
}
