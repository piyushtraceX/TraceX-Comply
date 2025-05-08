package database

import (
	"log"
	"time"

	"github.com/eudrcomply/api/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// ConnectDB establishes a connection to the database
func ConnectDB(dsn string) (*gorm.DB, error) {
	// Configure GORM
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to the database
	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Run migrations
	err = automigrate(db)
	if err != nil {
		return nil, err
	}

	log.Println("Connected to database")
	return db, nil
}

// automigrate runs database migrations
func automigrate(db *gorm.DB) error {
	// Migrate the schema
	err := db.AutoMigrate(
		&models.User{},
		&models.Tenant{},
		&models.Role{},
		&models.UserRole{},
		&models.Resource{},
		&models.Action{},
		&models.Permission{},
	)

	if err != nil {
		return err
	}

	return nil
}