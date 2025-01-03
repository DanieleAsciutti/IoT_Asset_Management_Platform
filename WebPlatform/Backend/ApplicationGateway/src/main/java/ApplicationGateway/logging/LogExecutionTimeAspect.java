package ApplicationGateway.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.IOException;

@Aspect
@Component
public class LogExecutionTimeAspect {

    @Around("@annotation(ApplicationGateway.logging.LogExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        String logEntry = String.format("%s,%d,%d,%d%n",
                joinPoint.getSignature().toShortString(), startTime, endTime, duration);

        String input = joinPoint.getSignature().toShortString();
        int lastDotIndex = input.indexOf('.');
        int openParenIndex = input.indexOf('(', lastDotIndex);

        String fileName = input.substring(lastDotIndex + 1, openParenIndex);

        fileName += "_logs.csv";
        fileName = "/logs/" + fileName;

        try (FileWriter writer = new FileWriter(fileName, true)) {
            writer.write(logEntry);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return result;
    }
}
