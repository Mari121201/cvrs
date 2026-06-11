package com.cvrs.backend.repository;

import com.cvrs.backend.model.Child;
import com.cvrs.backend.model.VaccinationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VaccineScheduleRepository extends JpaRepository<VaccinationSchedule, Long> {

    List<VaccinationSchedule> findByChild(Child child);

    List<VaccinationSchedule> findByChildId(Long childId);

    @Query("SELECT vs FROM VaccinationSchedule vs WHERE vs.status = :status")
    List<VaccinationSchedule> findAllByStatus(@Param("status") String status);

    @Query("SELECT vs FROM VaccinationSchedule vs WHERE vs.dueDate BETWEEN :startDate AND :endDate")
    List<VaccinationSchedule> findByDueDateBetween(@Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);


    @Query("SELECT vs FROM VaccinationSchedule vs WHERE vs.dueDate = :date AND vs.status = 'PENDING'")
    List<VaccinationSchedule> findPendingSchedulesByDueDate(@Param("date") LocalDate date);

    @Query("SELECT vs FROM VaccinationSchedule vs WHERE vs.dueDate < :date AND vs.status = 'PENDING'")
    List<VaccinationSchedule> findOverdueSchedules(@Param("date") LocalDate date);

    @Query("SELECT vs FROM VaccinationSchedule vs WHERE vs.child.parent.id = :parentId")
    List<VaccinationSchedule> findByParentId(@Param("parentId") Long parentId);

    @Query("SELECT vs FROM VaccinationSchedule vs WHERE vs.administeredDate BETWEEN :startDate AND :endDate")
    List<VaccinationSchedule> findByAdministeredDateBetween(@Param("startDate") LocalDate startDate,
                                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(vs) FROM VaccinationSchedule vs WHERE vs.dueDate = :date")
    long countByDueDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(vs) FROM VaccinationSchedule vs WHERE vs.dueDate = :date AND vs.status = :status")
    long countByDueDateAndStatus(@Param("date") LocalDate date, @Param("status") String status);


    @Query("SELECT COUNT(vs) FROM VaccinationSchedule vs WHERE vs.status = 'PENDING' AND vs.dueDate BETWEEN :startDate AND :endDate")
    long countPendingBetweenDates(@Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT vs FROM VaccinationSchedule vs WHERE vs.status = :status ORDER BY vs.administeredDate DESC")
    List<VaccinationSchedule> findTop5ByStatusOrderByAdministeredDateDesc(@Param("status") String status);




    @Query("SELECT COUNT(vs) FROM VaccinationSchedule vs WHERE vs.status = :status")
    Long countByStatus(@Param("status") String status);

    @Query("SELECT COUNT(vs) FROM VaccinationSchedule vs WHERE vs.status = 'PENDING' AND vs.dueDate < :date")
    Long countOverdueSchedules(@Param("date") LocalDate date);

    @Query("SELECT COUNT(vs) FROM VaccinationSchedule vs WHERE vs.status = 'COMPLETED' AND vs.administeredDate BETWEEN :startDate AND :endDate")
    Long countCompletedBetweenDates(@Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(vs) FROM VaccinationSchedule vs WHERE vs.administeredDate BETWEEN :start AND :end")
    Long countCompletedByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

}