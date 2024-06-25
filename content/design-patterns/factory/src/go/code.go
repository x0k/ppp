package factory

type PaymentSystemType string

const (
	PayPal   PaymentSystemType = "paypal"
	WebMoney PaymentSystemType = "webmoney"
	CatBank  PaymentSystemType = "cat-bank"
)

func Payment(tp PaymentSystemType, base int, amount int) int {
	panic("Not implemented")
}
