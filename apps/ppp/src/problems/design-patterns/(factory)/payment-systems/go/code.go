package solution

type SystemType int

const (
	PayPal SystemType = iota
	WebMoney
	CatBank
)

func Payment(tp SystemType, base int, amount int) int {
	panic("Not implemented")
}
