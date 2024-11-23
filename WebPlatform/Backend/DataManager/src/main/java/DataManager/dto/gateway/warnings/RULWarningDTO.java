package DataManager.dto.gateway.warnings;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@ToString
@Getter
public class RULWarningDTO {

    private Long id;

    private String caseTitle;

    private String deviceId;

    private String deviceName;

    private LocalDateTime creationDateTime;

    private String level1;

    private String level2;

    private String level3;

    private String assignedTo;

    private String device_rlu;

//    public RLUWarningDTO(Long id, String caseTitle, String deviceId, String deviceName, LocalDateTime timestamp, String level1, String level2, String level3, String device_rlu) {
//        super(id, caseTitle, deviceId, deviceName, timestamp, level1, level2, level3, null);
//        this.device_rlu = device_rlu;
//    }
}
