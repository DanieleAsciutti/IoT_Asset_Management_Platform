package Middleware.dto.server;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class MultipleModelsDTO {

    private byte[] model;

    private List<String> deviceIds;
}
