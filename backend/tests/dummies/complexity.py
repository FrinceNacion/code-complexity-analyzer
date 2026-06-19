
for i in range(12):
    for j in range(6):
        print(i+j)

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