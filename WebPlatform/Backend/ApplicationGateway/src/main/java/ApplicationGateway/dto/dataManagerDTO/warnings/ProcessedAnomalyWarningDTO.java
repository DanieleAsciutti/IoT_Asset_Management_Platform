package ApplicationGateway.dto.dataManagerDTO.warnings;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
public class ProcessedAnomalyWarningDTO{

    private Long id;

    private String caseTitle;

    private String deviceId;

    private String deviceName;

    private LocalDateTime creationDateTime;

    private String level1;

    private String level2;

    private String level3;

    private String assignedTo;

    private String anomaly_description;

    private LocalDateTime processed_date_time;

    private Boolean processed;

    private String note;

    private Boolean is_anomaly_correct;

    private String technician_anomaly;
}
