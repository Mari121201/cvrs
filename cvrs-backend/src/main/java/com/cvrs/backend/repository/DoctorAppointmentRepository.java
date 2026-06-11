package com.cvrs.backend.repository;

import com.cvrs.backend.model.DoctorAppointment;
import com.cvrs.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoctorAppointmentRepository extends JpaRepository<DoctorAppointment, Long> {

    List<DoctorAppointment> findByDoctor(User doctor);

    List<DoctorAppointment> findByDoctorId(Long doctorId);

    @Query("SELECT a FROM DoctorAppointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
    List<DoctorAppointment> findByDoctorIdAndStatus(@Param("doctorId") Long doctorId, @Param("status") String status);

    @Query("SELECT a FROM DoctorAppointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate BETWEEN :startDate AND :endDate")
    List<DoctorAppointment> findByDoctorIdAndDateRange(@Param("doctorId") Long doctorId,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM DoctorAppointment a WHERE a.status = :status ORDER BY a.appointmentDate DESC")
    List<DoctorAppointment> findAllByStatus(@Param("status") String status);

    @Query("SELECT a FROM DoctorAppointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate")
    List<DoctorAppointment> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);


    @Query("SELECT a FROM DoctorAppointment a WHERE a.child.id IN :childIds ORDER BY a.appointmentDate DESC")
    List<DoctorAppointment> findByChildIdInOrderByAppointmentDateDesc(@Param("childIds") List<Long> childIds);

    @Query("SELECT a FROM DoctorAppointment a WHERE a.child.id = :childId AND a.appointmentDate BETWEEN :startDate AND :endDate")
    List<DoctorAppointment> findByChildIdAndDateRange(@Param("childId") Long childId,
                                                      @Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM DoctorAppointment a ORDER BY a.appointmentDate DESC")
    List<DoctorAppointment> findAllByOrderByAppointmentDateDesc();

    long count();

    @Query("SELECT a FROM DoctorAppointment a WHERE a.status = :status ORDER BY a.createdAt DESC")
    List<DoctorAppointment> findTop5ByStatusOrderByCreatedAtDesc(@Param("status") String status);

    @Query("SELECT a FROM DoctorAppointment a WHERE a.status = :status ORDER BY a.updatedAt DESC")
    List<DoctorAppointment> findTop5ByStatusOrderByUpdatedAtDesc(@Param("status") String status);

    @Query("SELECT a FROM DoctorAppointment a ORDER BY a.updatedAt DESC")
    List<DoctorAppointment> findTop10ByOrderByUpdatedAtDesc();

    List<DoctorAppointment> findByDoctorIdOrderByAppointmentDateDesc(Long doctorId);

    @Query("SELECT COUNT(a) FROM DoctorAppointment a WHERE a.doctor.id = :doctorId")
    Long countByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(a) FROM DoctorAppointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
    Long countByDoctorIdAndStatus(@Param("doctorId") Long doctorId, @Param("status") String status);

    @Query("SELECT COUNT(DISTINCT a.child.id) FROM DoctorAppointment a WHERE a.doctor.id = :doctorId")
    Long countDistinctPatientsByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(a) FROM DoctorAppointment a WHERE a.appointmentDate BETWEEN :start AND :end")
    Long countByAppointmentDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM DoctorAppointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate BETWEEN :start AND :end")
    Long countByDoctorIdAndDateBetween(@Param("doctorId") Long doctorId,
                                       @Param("start") LocalDateTime start,
                                       @Param("end") LocalDateTime end);
}