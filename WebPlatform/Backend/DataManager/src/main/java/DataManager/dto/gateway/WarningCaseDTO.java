package DataManager.dto.gateway;

import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class WarningCaseDTO {

    private Long id;

    private String caseTitle;

    private String deviceId;

    private String deviceName;

    private LocalDateTime timestamp;

    private String level1;

    private String level2;

    private String level3;
}
