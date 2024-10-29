package ApplicationGateway.dto.frontend;

import ApplicationGateway.dto.enums.Warning;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class ProcessCaseDTO {

    private long id;

    private Warning warning;

    private Boolean is_correct;

    private String description;

    private String note;
}
