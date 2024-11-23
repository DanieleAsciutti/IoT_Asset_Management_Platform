package ApplicationGateway.dto.dataManagerDTO.warnings;

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
}
