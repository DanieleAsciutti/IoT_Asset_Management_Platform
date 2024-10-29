package ApplicationGateway.dto.frontend;

import ApplicationGateway.dto.enums.Warning;
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
