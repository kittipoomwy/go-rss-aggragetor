package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const tokenTTL = 24 * time.Hour

func MakeJWT(userID uuid.UUID, secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Issuer:    "rss-aggregator",
		Subject:   userID.String(),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(tokenTTL)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	})
	return token.SignedString([]byte(secret))
}

func ValidateJWT(tokenStr, secret string) (uuid.UUID, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &jwt.RegisteredClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return uuid.Nil, err
	}
	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid {
		return uuid.Nil, errors.New("invalid token")
	}
	id, err := uuid.Parse(claims.Subject)
	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}
