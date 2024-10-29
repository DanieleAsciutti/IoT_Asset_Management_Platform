package DataManager.dto.gateway.warnings;


import DataManager.dto.enums.Warning;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@ToString
@Getter
public class AssignCaseDTO {

    private long id;

    private Warning warning;

    private String tag;
}
