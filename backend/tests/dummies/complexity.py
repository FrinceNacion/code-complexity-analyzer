nums = [1,23,4,12,42,3]
a = (a for a in range(11)) # (+1)
x = [x for x in nums if x % 2 == 0] # (+2)
y = [(x, y) for x in nums for y in nums if x != y] # (+3)

for i in range(12):
    for j in range(6): pass
        #print(i+j)

inParentheses = True
inQoute = False

while(inParentheses):
    if inParentheses and inQoute:
        print('inside qoute and parentheses')
    elif inParentheses: 
        pass
    else: # does NOT contribute in the cyclomatic complexity (+0)
        pass

dummy = 'as'
match dummy:
    case 'awsd':
        pass
    case 'awe':
        pass
    case 'as':
        pass
