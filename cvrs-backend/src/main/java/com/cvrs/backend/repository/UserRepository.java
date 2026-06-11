package com.cvrs.backend.repository;

import com.cvrs.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(String role);

    @Query("SELECT u FROM User u WHERE u.isDeleted = false AND u.role = :role")
    List<User> findAllActiveByRole(@Param("role") String role);

    @Query("SELECT u FROM User u WHERE u.isDeleted = false")
    List<User> findAllActive();


    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isDeleted = false")
    long countActiveByRole(@Param("role") String role);

    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<User> searchUsers(@Param("search") String search);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND DATE(u.createdAt) = :date")
    long countByRoleAndCreatedAtDate(@Param("role") String role, @Param("date") LocalDate date);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.createdAt BETWEEN :startDate AND :endDate")
    long countNewUsersByRoleAndDateRange(@Param("role") String role,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);

    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT u FROM User u WHERE u.role = :role ORDER BY u.createdAt DESC")
    List<User> findTop5ByRoleOrderByCreatedAtDesc(@Param("role") String role);


    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(@Param("role") String role);
}
