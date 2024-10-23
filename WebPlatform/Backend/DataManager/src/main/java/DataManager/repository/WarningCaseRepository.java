package DataManager.repository;

import DataManager.model.relDB.WarningCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface WarningCaseRepository extends JpaRepository<WarningCase, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM WarningCase WHERE id = ?1")
    void deleteById(Long id);

}
