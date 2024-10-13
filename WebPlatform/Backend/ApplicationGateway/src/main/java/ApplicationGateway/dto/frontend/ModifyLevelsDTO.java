package ApplicationGateway.dto.frontend;


import ApplicationGateway.dto.enums.Levels;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class ModifyLevelsDTO {

    private Levels level;
    private String oldLevel1;
    private String oldLevel2;
    private String oldLevel3;
    private String newLevel;
}
