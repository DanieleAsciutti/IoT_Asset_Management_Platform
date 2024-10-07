package Middleware.dto.server;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class DeviceIdsDTO {
    private List<String> deviceIds;
}
